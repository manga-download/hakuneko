import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaWT extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangawt';
        super.label = 'MangaWT';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'http://mangawt.com';

        this.language = 'tr';
    }
}