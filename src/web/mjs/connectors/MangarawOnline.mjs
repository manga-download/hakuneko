import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangarawOnline extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangarawonline';
        super.label = 'Mangaraw Online';
        this.tags = [ 'manga', 'high-quality', 'raw' ];
        this.url = 'http://mangaraw.online';
    }
}