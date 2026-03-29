import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ayatoon extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ayatoon';
        super.label = 'AYATOON';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://ayatoon.com';
        this.path = '/manga/list-mode';
    }
}
