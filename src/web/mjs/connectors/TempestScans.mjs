import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class TempestScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tempestscans';
        super.label = 'Tempest Scans';
        this.tags = ['manga', 'turkish'];
        this.url = 'https://tempestmangas.com';
        this.path = '/manga/list-mode/';
    }
}
