import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans';
        super.label = 'Flame Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.flame-scans.com';
        this.path = '/manga/list-mode/';
    }
}