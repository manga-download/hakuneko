import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GeassScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'geassscan';
        super.label = 'Geass Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://geassscan.xyz';
        this.path = '/manga/list-mode/';
    }
}
