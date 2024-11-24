import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Hentaidexy extends Connector {

    constructor() {
        super();
        super.id = 'hentaidexy';
        super.label = 'Hentaidexy';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://hentaidexy.net';
        this.apiUrl = 'https://backend.hentaidexy.net';
        this.imageBaseUrl = 'https://minio-server.hentaidexy.net:9000';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/\/manga\/([\S]+)\//)[1];
        const url = new URL('/api/v1/mangas/'+ id, this.apiUrl);
        const request = new Request(url, this.requestOptions);
        const jObject = await this.fetchJSON(request);
        return new Manga(this, id, jObject.manga.title.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/api/v1/mangas?page=' + page+'&sort=createdAt', this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.mangas.map(element => {
            return {
                id: element._id,
                title: element.title.trim()
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
        const uri = new URL('/api/v1/mangas/'+ manga.id+ '/chapters?sort=-serialNumber&limit=9999&page='+page, this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.chapters.map(element => {
            return {
                id: element._id,
                title: 'Chapter '+ element.serialNumber
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/v1/chapters/'+ chapter.id, this.apiUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.chapter.images.map(image => {
            const lastpart = image.split('/').pop();
            return new URL('/hentaidexy/'+lastpart, this.imageBaseUrl).href;
        });
    }
}
