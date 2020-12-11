import AnyACG from './templates/AnyACG.mjs';

export default class MangaNeloToday extends AnyACG {

    constructor() {
        super();
        super.id = 'manganelotoday';
        super.label = 'MangaNelo (by AnyACG)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://manganelos.com';

        this.queryPages = 'div.chapter-content-inner p#arraydata';
        this.queryMangaTitle = 'ol > li:nth-child(3)';
        this.queryMangaTitleText = 'a';
        this.queryChapters = '#examples a';
        this.queryMangaLink = 'a';
        this.queryMangas ='div.media-body';
    }
}