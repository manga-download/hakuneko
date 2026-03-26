import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AlphaScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'alphascans';
        super.label = 'Alpha Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://alpha-scans.org';
        this.path = '/manga/list-mode/';
    }
}