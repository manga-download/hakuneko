import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PixivComics extends Connector {

    constructor() {
        super();
        this.id = 'pixivcomics';
        this.label = 'pixivコミック';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic.pixiv.net';
        this.links = {
            login: 'https://accounts.pixiv.net/login'
        };
        this.apiURL = 'https://comic.pixiv.net/api/app/';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-requested-with', this.url);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL('works/v5/' + uri.pathname.match(/\d+$/)[0], this.apiURL), this.requestOptions);
        const data = await this.fetchJSON(request);
        const id = data.data.official_work.id;
        const title = data.data.official_work.name.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('magazines', this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = data.data.magazines.map(item => item.id);
        for (let page of pages) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`magazines/v2/${page}/works`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.official_works.map(item => {
            return {
                id: item.id,
                title: item.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaId, page) {
        const uri = new URL(`works/${mangaId}/episodes?page=${page}`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request);
        return data.episodes
            .filter(item => item.readable)
            .map(item => {
                return {
                    id: item.episode.id, // this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: item.episode.numbering_title + (!item.episode.sub_title ? '' : ' - ' + item.episode.sub_title), // element.text.trim(),
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        const timestamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        const hash = CryptoJS.MD5(timestamp + 'mAtW1X8SzGS880fsjEXlM73QpS1i4kUMBhyhdaYySk8nWz533nrEunaSplg63fzT').toString(CryptoJS.enc.Hex);
        const uri = new URL(`episodes/${chapter.id}/read`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-requested-with', 'pixivcomic');
        request.headers.set('x-client-time', timestamp);
        request.headers.set('x-client-hash', hash);
        const data = await this.fetchJSON(request);
        return data.data.reading_episode.pages.map(image => this.createConnectorURI(image.url));
    }
}