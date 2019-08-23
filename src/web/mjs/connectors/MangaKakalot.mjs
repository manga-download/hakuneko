import MangaNel from './MangaNel.mjs';

/**
 *
 */
export default class MangaKakalot extends MangaNel {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangakakalot';
        super.label = 'MangaKakalot';
        this.tags = [ 'manga', 'english' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangakakalot.com';
    }
}