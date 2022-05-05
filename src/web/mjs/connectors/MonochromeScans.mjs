import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MonochromeScans extends Connector {

    constructor() {
        super();
        super.id = 'monochromescans';
        super.label = 'Monochrome Scans';
        this.tags = ['manga', 'english', 'scanlation'];
        this.url = 'https://manga.d34d.one';
        this.apiurl = 'https://api.manga.d34d.one';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/([^/]*)\/*$/)[1];
        const url = new URL('/manga/' + id, this.apiurl);
        const request = new Request(url, this.requestOptions);
        const { title } = await this.fetchJSON(request);
        return new Manga(this, id, title);
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
        const uri = new URL('/manga', this.apiurl);
        uri.searchParams.set('limit', 50);
        uri.searchParams.set('offset', (page - 1) * 50);
        const request = new Request(uri, this.requestOptions);
        const { results } = await this.fetchJSON(request);
        return results.map(item => {
            return {
                id: item.id,
                title: item.title
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(`/manga/${manga.id}/chapters`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const chapters = await this.fetchJSON(request);
        return chapters.map(chapter => {
            let title = '';
            if(chapter.volume) {
                title += `Volume ${chapter.volume} `;
            }
            title += `Chapter ${parseInt(chapter.number) == chapter.number ? parseInt(chapter.number) : chapter.number}`;
            if(chapter.name != '') {
                title += ` - ${chapter.name}`;
            }
            return {
                id: chapter.id,
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/chapter/${chapter.id}`, this.apiurl);
        const request = new Request(uri, this.requestOptions);
        const { length, mangaId, version } = await this.fetchJSON(request);
        return new Array(length).fill(0).map((page, index) => `${this.apiurl}/media/${mangaId}/${chapter.id}/${index + 1}.jpg?version=${version}`);
    }
}