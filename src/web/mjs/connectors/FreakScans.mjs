import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FreakScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'freakscans';
        super.label = 'Freak Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://freakscans.com/';
        this.path = '/manga/list-mode';
    }
}