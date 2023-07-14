import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LyraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lyrascans';
        super.label = 'Lyra Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://lyrascans.com';
        this.path = '/manga/list-mode/';
    }
}