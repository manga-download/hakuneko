import MangaNel from './MangaNel.mjs';

export default class MangaBat extends MangaNel {

    constructor() {
        super();
        super.id = 'mangabat';
        super.label = 'MangaBat';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://h.mangabat.com';

        this.path = '/manga-list-all/';
        this.queryMangas = 'div.panel-list-story div.list-story-item h3 a.item-title';
        // NOTE: a corresponding entry for chapter/page queries must be defined in the base class (required for cross-domain-support)
    }

    canHandleURI(uri) {
        // Test: https://regex101.com/r/GlzAw2/2/tests
        return /^(m\.|read\.|h\.)?mangabat\.com$/.test(uri.hostname);
    }
}
