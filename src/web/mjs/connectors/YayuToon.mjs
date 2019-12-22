import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class YayuToon extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'yayutoon';
        super.label = 'YAYUTOON';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'http://www.yayutoon.com';

        this.language = 'tr';
    }
}