import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PrismaScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'prismascans';
        super.label = 'Demon Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.path = '/comics/list-mode/';
        this.url = 'https://seitacelestial.com';
    }
}
