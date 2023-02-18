import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RRScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'RRScans';
        super.label = 'Romance Reader Scans';
        this.tags = [ 'manga', 'indonesian', 'webtoon', 'scanlation', 'manhua', 'manhwa' ];
        this.url = 'https://rrscans.my.id';
        this.path = '/manga/list-mode';
    }
}