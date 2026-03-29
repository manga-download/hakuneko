import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class lemonjuicescan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lemonjuicescan';
        super.label = 'Lemon Juice Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://lemonjuicescan.com';
        this.path = '/manga/list-mode';
    }
}