import MangaInn from './MangaInn.mjs';

export default class FunManga extends MangaInn {
    constructor() {
        super();
        super.id = 'funmanga';
        super.label = 'FunManga';
        this.tags = ['manga', 'english'];
        this.url = 'http://www.funmanga.com';
    }
}