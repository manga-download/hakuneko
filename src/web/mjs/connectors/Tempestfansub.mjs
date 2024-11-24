import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Tempestfansub extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tempestfansub';
        super.label = 'Tempestfansub';
        this.tags = [ 'webtoon', 'manga', 'turkish' ];
        this.url = 'https://tempestfansub.com';
        this.path = '/manga/list-mode/';
    }
}
