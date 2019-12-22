import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class NSDAPFansub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'nsdapfansub';
        super.label = 'NSDAP Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'http://nsdapfansub.com';

        this.language = 'tr';
    }
}