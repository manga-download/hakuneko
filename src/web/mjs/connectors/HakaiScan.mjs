import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class HakaiScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'hakaiscan';
        super.label = 'Hakai Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'http://hakaiscan.xyz';
        this.path = '/manga/list-mode/';
    }
}