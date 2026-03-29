import MangaNel from './MangaNel.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaIro extends MangaNel {

    constructor() {
        super();
        super.id = 'mangairo';
        super.label = 'Mangairo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://w.mangairo.com';

        this.path = '/manga-list/type-latest/ctg-all/state-all/page-';
        this.queryMangaTitle = /name_title\s*=\s*['"](.+)['"]\s*;/g;
        this.queryMangasPageCount = 'div.group-page a.go-p-end';
        this.queryMangas = 'div.story-list div.story-item h3.story-name a';
        // NOTE: a corresponding entry for chapter/page queries must be defined in the base class (required for cross-domain-support)
    }

    canHandleURI(uri) {
        // Verification: https://regex101.com/r/pZFHj3/2/tests
        return /^(m\.|chap\.)?mangairo\.com$/.test(uri.hostname);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchRegex(request, this.queryMangaTitle);
        let id = uri.href;
        let title = data[0].trim();
        return new Manga(this, id, title);
    }
}
