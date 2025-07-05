import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Japanesemanga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'japanesemanga';
        super.label = 'มังงะญี่ปุ่น';
        this.tags = [ 'webtoon', 'thai', 'manga' ];
        this.url = 'https://xn--72cas2cj6a4hf4b5a8oc.com';
        this.path = '/manga/list-mode/';
    }
}