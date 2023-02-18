import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MoonScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'moonscans';
        super.label = 'Moon Scans English';
        this.tags = [ 'manga', 'english', 'webtoon', 'scanlation', 'manhua', 'manhwa' ];
        this.url = 'https://moonscans.xyz';
        this.path = '/manga/list-mode';
    }
}