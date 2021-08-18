import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OniScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'oniscans';
        super.label = 'Oniscans';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://www.oniscans.com';
        this.path = '/manga/list-mode/';
    }
}