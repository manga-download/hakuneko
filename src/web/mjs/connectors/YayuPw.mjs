import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class YayuPw extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'yayupw';
        super.label = 'Yayu Pw';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://yayu.pw';

        this.language = 'tr';
    }
}