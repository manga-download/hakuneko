import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class CosmicScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'cosmicscansid';
        super.label = 'Cosmic Scans Indonesia';
        this.tags = [ 'manga', 'indonesian', 'webtoon', 'scanlation', 'manhua', 'manhwa' ];
        this.url = 'https://cosmicscans.id';
        this.path = '/manga/list-mode';
    }
}