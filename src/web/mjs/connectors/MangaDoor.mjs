import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaDoor extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangadoor';
        super.label = 'MangaDoor';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'http://mangadoor.com';

        this.language = 'es';
    }
}