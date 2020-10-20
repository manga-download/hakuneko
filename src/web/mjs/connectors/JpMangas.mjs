import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class JpMangas extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'jpmangas';
        super.label = 'JpMangas';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.jpmangas.com';

        this.language = 'fr';
    }
}