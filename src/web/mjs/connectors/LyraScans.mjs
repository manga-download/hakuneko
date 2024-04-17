import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LyraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lyrascans';
        super.label = 'Quantum Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://readers-point.space';
        this.path = '/series/list-mode/';
    }
}
