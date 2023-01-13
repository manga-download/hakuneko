import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Mangajp extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'mangajp';
        super.label = '漫画RAW(mangajp)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://mangajp.top';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages.map(page => this.createConnectorURI(page));
    }
}