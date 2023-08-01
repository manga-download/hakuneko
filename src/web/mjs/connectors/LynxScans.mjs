import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LynxScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'secretscans';
        super.label = 'Lynx Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://lynxscans.com';
        this.path = '/comics/list-mode/';
    }
}
