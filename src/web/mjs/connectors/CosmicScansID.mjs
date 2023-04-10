import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class CosmicScansID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'cosmicscansid';
        super.label = 'Cosmic Scans ID';
        this.tags = ['manga', 'indonesia', 'webtoon', 'scanlation'];
        this.url = 'https://cosmicscans.id';
        this.path = '/manga/list-mode';
    }
}
