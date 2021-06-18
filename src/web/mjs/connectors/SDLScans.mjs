import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SDLScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sdlscans';
        super.label = 'SDL Scans';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://sdlscans.com';
        this.path = '/manga/list-mode/';
    }
}