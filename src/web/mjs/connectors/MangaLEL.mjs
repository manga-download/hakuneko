import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaLEL extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangalel';
        super.label = 'Manga-LEL';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.manga-lel.com';

        this.language = 'fr';
    }
}