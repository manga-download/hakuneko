import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class KomikManga extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikmanga';
        super.label = 'KomikManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikmanga.com';

        this.language = 'in';
    }
}