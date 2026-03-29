import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Oxapk extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'oxapk';
        super.label = 'Oxapk';
        this.tags = ['webtoon', 'arabic', 'scanlation'];
        this.url = 'https://oxapk.com';
        this.path = '/manga/list-mode/';
    }
}