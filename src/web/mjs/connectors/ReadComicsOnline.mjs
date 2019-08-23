import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class ReadComicsOnline extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readcomicsonline';
        super.label = 'Read Comics Online';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://readcomicsonline.ru';

        this.language = 'en';
    }
}