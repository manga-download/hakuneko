import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class CosmicScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'cosmicscans';
        super.label = 'Cosmic Scans';
        this.tags = [ 'manga', 'english', 'webtoon', 'scanlation' ];
        this.url = 'https://cosmicscans.com';
        this.path = '/manga/list-mode';
    }
}