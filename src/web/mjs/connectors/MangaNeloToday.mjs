import AnyACG from './templates/AnyACG.mjs';

export default class MangaNeloToday extends AnyACG {

    constructor() {
        super();
        super.id = 'manganelotoday';
        super.label = 'MangaNelo (by AnyACG)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://manganelo.today';

        this.queryPages = 'div.chapter-content-inner p#arraydata';
    }
}