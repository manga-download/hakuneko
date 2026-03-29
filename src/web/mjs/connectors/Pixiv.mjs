import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Pixiv extends Connector {

    constructor() {
        super();
        this.id = 'pixiv';
        this.label = 'pixiv (Artwork)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.pixiv.net';
        this.links = {
            login: 'https://accounts.pixiv.net/login'
        };
        this.apiURL = 'https://www.pixiv.net/ajax/';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        if(uri.pathname.match(/\/series\/\d+/)) {
            const id = uri.pathname.match(/\/series\/(\d+)/)[1];
            const request = new Request(new URL(`series/${id}?p=1&lang=en`, this.apiURL), this.requestOptions);
            const data = await this.fetchJSON(request);
            const title = data.body.illustSeries.filter(s => s.id === id).map(s => s.title.trim()).pop();
            return new Manga(this, id, title);
        } else if (uri.pathname.match(/\/artworks\/\d+/)) {
            const id = uri.pathname.match(/\/artworks\/(\d+)/)[1];
            const request = new Request(new URL(`illust/${id}?lang=en`, this.apiURL), this.requestOptions);
            const data = await this.fetchJSON(request);
            const title = data.body.illustTitle.trim();
            return new Manga(this, `artwork-${id}`, title);
        } else {
            throw new Error('Provided link doesn\'t contain manga series or artwork!');
        }
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let chapterList = [];
        if (manga.id.startsWith('artwork-')) {
            chapterList.push({
                id: manga.id.match(/artwork-(\d+)/)[1],
                title: manga.title
            });
        } else {
            for (let page = 1, run = true; run; page++) {
                const chapters = await this._getChaptersFromPage(manga.id, page);
                chapters.length > 0 ? chapterList.push(...chapters) : run = false;
            }
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaId, page) {
        const uri = new URL(`series/${mangaId}?p=${page}&lang=en`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        let chapterListFromPage = [];
        data.body.page.series.forEach(chapter => {
            const chapterContents = data.body.thumbnails.illust.find(c => c.id === chapter.workId);
            if (chapterContents) {
                chapterListFromPage.push({
                    id: chapterContents.id,
                    title: chapterContents.title.trim()
                });
            }
        });
        return chapterListFromPage;
    }

    async _getPages(chapter) {
        const uri = new URL(`illust/${chapter.id}/pages?lang=en`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.body.map(image => this.createConnectorURI(image.urls.original));
    }
}