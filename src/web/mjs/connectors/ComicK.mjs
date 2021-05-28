import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicK extends Connector {

    constructor() {
        super();
        super.id = 'comick';
        super.label = 'ComicK';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://comick.fun';
    }

    async _getEmbeddedJSON(uri) {
        const request = new Request(uri, this.requestOptions);
        const scripts = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        const data = JSON.parse(scripts[0].text);
        return data.props.pageProps;
    }

    async _getMangaFromURI(uri) {
        const data = await this._getEmbeddedJSON(uri);
        return new Manga(this, data.comic.id, data.comic.title.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/api/get_newest_chapters?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return !data.data ? [] : data.data.map(item => {
            return {
                id: item.md_comics.id,
                title: item.md_comics.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL('/api/get_chapters', this.url);
        uri.searchParams.set('comicid', manga.id);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.chapters.map(item => {
            let title = [];
            if(item.vol) {
                title.push('Vol.', item.vol);
            }
            title.push('Ch.', item.chap);
            if(item.title) {
                title.push('-', item.title);
            }
            title.push('(' + item.iso639_1 + ')');
            if(item.md_groups && item.md_groups.length) {
                title.push('[' + item.md_groups.map(g => g.title).join(', ') + ']');
            }
            return {
                id: [ item.hid, 'chapter', item.chap, item.iso639_1 ].join('-'), // item.id
                title: title.join(' '),
                language: item.langName
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL([ '', 'comic', chapter.manga.id, chapter.id ].join('/'), this.url);
        const data = await this._getEmbeddedJSON(uri);
        return data.chapter.md_images.map(image => {
            if(image.gpurl) {
                return 'https://lh3.googleusercontent.com/' + image.gpurl + '=w0-h0';
            } else {
                return 'https://' + [ data.chapter.server, data.chapter.hash, image.name ].join('/');
            }
        });
    }
}