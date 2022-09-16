import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LianScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lianscans';
        super.label = 'LIAN';
        this.tags = [ 'manga', 'indonesian', 'scanlation' ];
        this.url = 'https://www.lianscans.my.id';
        this.path = '/manga/list-mode';
    }
}
