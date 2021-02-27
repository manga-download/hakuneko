import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class HikariScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'hikariscan';
        super.label = 'Hikari Scan';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://hikariscan.com.br';
        this.path = '/manga/list-mode/';
    }
}