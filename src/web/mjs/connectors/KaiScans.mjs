import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KaiScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kaiscans';
        super.label = 'Kai Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://kaiscans.org';
        this.path = '/manga/list-mode/';
    }
}
