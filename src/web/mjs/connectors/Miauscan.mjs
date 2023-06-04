import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MiauScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'miauscan';
        super.label = 'MiauScan';
        this.tags = [ 'manga', 'spanish', 'portuguese', 'scanlation' ];
        this.url = 'https://miauscan.com';
        this.path = '/manga/list-mode/';
    }
}