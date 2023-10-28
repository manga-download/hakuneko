import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OmegaScans extends Connector {

    constructor() {
        super();
        super.id = 'omegascans';
        super.label = 'OmegaScans';
        this.tags = [ 'webtoon', 'scanlation', 'english', 'hentai'];
        this.url = 'https://omegascans.org';
        this.api = 'https://api.omegascans.org';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/\/series\/([^/]+)/)[1];
        const url = new URL(`/series/${id}/`, this.api);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, id, data.title);
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/query?page=${page}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return{
                id: element.series_slug,
                title : element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(`/series/${manga.id}/`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const chapters = [];

        for (const season of data.seasons) {
            for (const chapter of season.chapters) {
                chapters.push({
                    id : chapter.chapter_slug,
                    title : chapter.chapter_name
                });
            }
        }
        return chapters;
    }

    async _getPages(chapter) {
        const uri = new URL(`/chapter/${chapter.manga.id}/${chapter.id}`, this.api);
        const { data } = await this.fetchJSON(new Request(uri, this.requestOptions));
        return data.map(element => this.createConnectorURI(new URL(element, this.api).href));
    }
}
