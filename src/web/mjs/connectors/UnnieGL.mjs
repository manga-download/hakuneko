import TuMangaOnline from './TuMangaOnline.mjs';

export default class UnnieGL extends TuMangaOnline {

    constructor() {
        super();
        super.id = 'unniegl';
        super.label = 'UnnieGL';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://www.unniegl.com';
    }
}