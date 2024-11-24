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
        super.label = 'ReadComicsOnline.ru';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://readcomicsonline.ru';
        this.links = {
            login: 'https://readcomicsonline.ru/auth/login'
        };

        this.language = 'en';
    }
}