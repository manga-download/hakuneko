import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class HeanCms extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.api = undefined;
        this.path = '';
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/')[2];
        const url = new URL(`/series/${slug}`, this.api);
        const request = new Request(url, this.requestOptions);
        const {title, series_slug} = await this.fetchJSON(request, this.requestOptions);
        return new Manga(this, series_slug, title);
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
        const request = new Request(new URL(`/query?series_type=All&order=asc&perPage=100&page=${page}`, this.api), this.requestOptions);
        const {data} = await this.fetchJSON(request);

        if (data.length) {
            return data.map((manga) => {
                return {
                    id: manga.series_slug,
                    title: manga.title ? manga.title.trim() : null
                };
            });
        }
        return [];
    }

    async _getChapters(manga) {
        const uri = new URL(`/series/${manga.id}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const {seasons} = await this.fetchJSON(request);
        let chapterList = [];

        seasons.map((season) => season.chapters.map((chapter) => {
            chapterList.push({
                id: JSON.stringify({
                    series: manga.id,
                    chapter: chapter.chapter_slug
                }),
                title: `${seasons.length > 1 ? 'S' + season.index : ''} ${chapter.chapter_name} ${chapter.chapter_title || ''}`.trim()
            });
        }));
        console.log(chapterList);
        return chapterList;
    }

    async _getPages(chapter) {
        const id = JSON.parse(chapter.id);
        const uri = new URL(`/chapter/${id.series}/${id.chapter}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const {data} = await this.fetchJSON(request, this.queryPages);
        return data;
    }
}