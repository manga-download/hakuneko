import NineManga from './templates/NineManga.mjs';

/**
 *
 */
export default class NineMangaIT extends NineManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ninemanga-it';
        super.label = 'NineMangaIT';
        this.tags = [ 'manga', 'italian' ];
        this.url = 'http://it.ninemanga.com';

        this.pageCount = 150;
    }
}