import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Komikru extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikru';
        super.label = 'Komikru';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://komikru.com';
        this.path = '/manga/?list';
    }
}