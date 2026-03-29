import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AceScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'acescans';
        super.label = 'Ace Scans';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://acescans.xyz';
        this.path = '/manga/list-mode/';
    }
}