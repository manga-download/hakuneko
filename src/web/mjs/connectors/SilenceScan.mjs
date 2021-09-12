import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SilenceScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'silencescan';
        super.label = 'Silence Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://silencescan.com.br';
        this.path = '/manga/list-mode/';
    }
}
