import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class WhiteCloudPavilion extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'whitecloudpavilion';
        super.label = 'White Cloud Pavilion';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://whitecloudpavilion.com';
        this.path = '/manga/free/';

        this.language = 'en';
    }
}