import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScansFR extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans-fr';
        super.label = 'Mangas Scans';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://mangas-scans.com';
        this.path = '/manga/list-mode/';
    }
}
