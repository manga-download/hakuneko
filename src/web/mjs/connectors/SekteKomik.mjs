import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SekteKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sektekomik';
        super.label = 'SEKTEKOMIK.COM';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://sektekomik.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages.map(page => this.createConnectorURI(page));
    }
}