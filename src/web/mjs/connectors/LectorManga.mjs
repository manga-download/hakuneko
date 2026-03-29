import TuMangaOnline from './TuMangaOnline.mjs';

export default class LectorManga extends TuMangaOnline {

    constructor() {
        super();
        super.id = 'lectormanga';
        super.label = 'LectorManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://lectormanga.com';
    }
}