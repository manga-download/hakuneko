import MangaNel from './MangaNel.mjs';

export default class MangaIro extends MangaNel {

    constructor() {
        super();
        super.id = 'mangairo';
        super.label = 'Mangairo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangairo.com';

        this.path = '/manga-list/type-latest/ctg-all/state-all/page-';
        this.queryMangasPageCount = 'div.group-page a.go-p-end';
        this.queryMangas = 'div.story-list div.story-item h3.story-name a';
        this.queryChapters = 'div.chapter_list ul li a';
        this.queryPages = 'div.chapter-content div.panel-read-story source';
    }
}