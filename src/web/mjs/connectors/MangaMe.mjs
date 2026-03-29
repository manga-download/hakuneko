import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MangaMe extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangame';
        super.label = 'MangaMe';
        this.tags = [ 'webtoon', 'manga', 'english' ];
        this.url = 'https://mangareading.org';
        this.queryMangas = 'div.card-item-title a';
        this.queryChapters = 'div.plm-chapters div.plm-grid a';
        this.queryChaptersTitleBloat = 'span';
    }
}
