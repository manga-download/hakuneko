import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class TempestScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tempestscans';
        super.label = 'Tempest Scans';
        this.tags = ['manga', 'turkish'];
        this.url = 'https://tempestscans.net';
        this.path = '/manga/list-mode/';
    }
}
