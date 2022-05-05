import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Guya extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.match(/([^/]*)\/*$/)[1];
        const url = new URL('/api/series/' + slug, this.url);
        const request = new Request(url, this.requestOptions);
        const { title } = await this.fetchJSON(request);
        return new Manga(this, slug, title);
    }

    async _getMangas() {
        const uri = new URL('/api/get_all_series', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return Object.entries(data).map(([key, value]) => {
            return {
                id: value.slug,
                title: key
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL('/api/series/' + manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return Object.entries(data.chapters).sort(([num1], [num2]) => parseFloat(num2) - parseFloat(num1)).map(([number, { title }]) => {
            return {
                id: number,
                title: `Chapter ${number}${title.length > 0 ? ' - ' + title : ''}`,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/series/' + chapter.manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const [pages, group] = this.getPagesInfo(data, chapter);
        return pages.map(page => `${this.url}/media/manga/${chapter.manga.id}/chapters/${data.chapters[chapter.id].folder}/${group}/${page}`);
    }

    getPagesInfo(data, chapter) {
        const groups = data.chapters[chapter.id].groups;
        const group = data.preferred_sort.shift() || Object.keys(groups).shift();
        return [groups[group], group];
    }
}