import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WestManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'westmanga';
        super.label = 'WestManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://westmanga.info';
        this.path = '/manga/?list';
    }
}