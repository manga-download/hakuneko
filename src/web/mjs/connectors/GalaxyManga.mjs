import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GalaxyManga extends Connector {

    constructor() {
        super();
        super.id = 'galaxymanga';
        super.label = 'Galaxy Manga';
        this.tags = ['webtoon', 'arabic', 'scanlation'];
        this.url = 'https://flixscans.com';
        this.api = 'https://api.flixscans.com';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('-')[1];
        const request = new Request(new URL(`/api/v1/webtoon/series/${id}`, this.api), this.requestOptions);
        const {serie} = await this.fetchJSON(request, this.requestOptions);
        return new Manga(this, serie.id, serie.title);
    }

    async _getMangas() {
        let mangaList = [];

        for (let page = 1, run = true; run; page++) {
            let list = await this._getMangasFromPage(page);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/api/v1/webtoon/homepage/type/manga?page=${page}`, this.api), this.requestOptions);
        const { data } = await this.fetchJSON(request);

        if (data.length) {
            return data.map((manga) => {
                return {
                    id: manga.id,
                    title: manga.title ? manga.title.trim() : null
                };
            });
        }
        return [];
    }

    async _getChapters(manga) {
        const uri = new URL(`/api/v1/webtoon/chapters/${manga.id}-desc`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);

        return data.map((chapter) => {
            return {
                id: chapter.id,
                title: `${chapter.name} ${chapter.title || ''}`.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/api/v1/webtoon/chapters/chapter/${chapter.id}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const images = data.chapter.chapterData.webtoon;
        return images.map((image) => `${this.api}/storage/${image}`);
    }
}