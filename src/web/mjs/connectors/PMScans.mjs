import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PMScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'pmscans';
        super.label = 'Rackus';
        this.tags = [ 'manga', 'webtoon', 'scanlation', 'english' ];
        this.url = 'https://rackusreader.org';
        this.path = '/manga/list-mode/';
    }
}