import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class UniversoYuri extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'universoyuri';
        super.label = 'Universo Yuri';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'http://www.universoyuri.com';
    }
}