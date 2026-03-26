import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Summertoon extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'summertoon';
        super.label = 'Summertoon';
        this.tags = ['webtoon', 'turkish', 'scanlation'];
        this.url = 'https://summertoon.com';
        this.path = '/manga/list-mode/';
    }
}
