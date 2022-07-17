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
        const id = uri.pathname.match(/\/series\/(\d+)/)[1];
        const request = new Request(new URL(`series/${id}?p=1&lang=en`, this.apiURL), this.requestOptions);
        const data = await this.fetchJSON(request);
        const title = data.body.illustSeries.filter(s => s.id === id).map(s => s.title.trim()).pop();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList.filter((chapter, index) => {
            return index === chapterList.findIndex(item => chapter.id === item.id);
        });
    }

    async _getChaptersFromPage(mangaId, page) {
        const uri = new URL(`series/${mangaId}?p=${page}&lang=en`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (data.body.thumbnails.illust.length < 5)
            return [];
        return data.body.thumbnails.illust
            .filter(chapter => chapter.seriesId === mangaId)
            .map(chapter => {
                return {
                    id: chapter.id,
                    title: chapter.title.trim()
                };
            });
    }

    async _getPages(chapter) {
        const uri = new URL(`illust/${chapter.id}/pages?lang=en`, this.apiURL);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.body.map(image => this.createConnectorURI(image.urls.original));
    }
}