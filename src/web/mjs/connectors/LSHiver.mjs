import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LSHiver extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lshiver';
        super.label = 'Liebe Schnee Hiver';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://lshistoria.com';
        this.path = '/manga/list-mode/';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}