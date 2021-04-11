import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PMScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'pmscans';
        super.label = 'PMScans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://reader.pmscans.com';
        this.path = '/manga/list-mode/';
    }
}