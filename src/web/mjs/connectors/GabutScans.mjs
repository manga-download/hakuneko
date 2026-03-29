import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GabutScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'gabutscans';
        super.label = 'Gabut Scans';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://gabutscans.com';
        this.path = '/manga/list-mode/';
    }
}