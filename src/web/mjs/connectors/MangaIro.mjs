import MangaNel from './MangaNel.mjs';

export default class MangaIro extends MangaNel {

    constructor() {
        super();
        super.id = 'mangairo';
        super.label = 'Mangairo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://m.mangairo.com';

        this.path = '/manga-list/type-latest/ctg-all/state-all/page-';
        this.queryMangaTitle = 'div.story_content ul.story_info_right h1';
        this.queryMangasPageCount = 'div.group-page a.go-p-end';
        this.queryMangas = 'div.story-list div.story-item h3.story-name a';
        // NOTE: a corresponding entry for chapter/page queries must be defined in the base class (required for cross-domain-support)
    }

    canHandleURI(uri) {
        // Verification: https://regex101.com/r/...
        return /^(m\.|chap\.)?mangairo.com$/.test(uri.hostname);
    }
}