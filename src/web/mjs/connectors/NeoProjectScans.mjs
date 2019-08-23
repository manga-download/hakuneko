import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class NeoProjectScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'neoprojectscans';
        super.label = 'NeoProjectScans';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://npscan.mangaea.net';
        this.path = '/slide/directory/';
        this.language = 'spanish';

        this.defaultPageCount = 5;
        this.queryMangas = 'div.directory div.grid div.grid-item a';
        this.queryChapters = 'div.list div.list-group div.list-group-item div.title a';
    }
}