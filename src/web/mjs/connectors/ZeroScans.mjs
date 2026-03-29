import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class ZeroScans extends Connector {

    constructor() {
        super();
        super.id = 'zeroscans';
        super.label = 'ZeroScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://zscans.com';

        this.config = {
            quality: {
                label: 'Preferred quality',
                description: 'The preferred quality of the chapters',
                input: 'select',
                options: [
                    { value: 'good_quality', name: 'Good Quality' },
                    { value: 'high_quality', name: 'High Quality' }
                ],
                value: 'high_quality'
            }
        };
    }

    async _getMangaFromURI(uri) {
        const slug = uri.href.match(/\/comics\/([^/]+)$/)[1];
        const detailsUrl = new URL(`/swordflake/comic/${slug}`, this.url);
        const request = new Request(detailsUrl, this.requestOptions);
        const { data } = await this.fetchJSON(request);
        return new Manga(this, `${data.id}_${data.slug}`, data.name.trim());
    }

    async _getMangas() {
        const uri = new URL('/swordflake/comics', this.url);
        const request = new Request(uri, this.requestOptions);
        const { data: { comics } } = await this.fetchJSON(request);
        return comics.map(item => {
            return {
                id: `${item.id}_${item.slug}`,
                title: item.name.trim()
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
        const uri = new URL(`/swordflake/comic/${manga.id.split('_')[0]}/chapters`, this.url);
        uri.searchParams.set('sort', 'desc');
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const { data: { data: chapters }} = await this.fetchJSON(request);
        return chapters.map(item => {
            return {
                id: item.id,
                title: `Chapter ${item.name}`,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/swordflake/comic/${chapter.manga.id.split('_')[1]}/chapters/${chapter.id}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request);
        return data.chapter[this.config.quality.value];
    }
}