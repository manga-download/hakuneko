import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class Komikid extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikid';
        super.label = 'Komikid';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.komikid.com';

        this.language = 'id';
    }
}