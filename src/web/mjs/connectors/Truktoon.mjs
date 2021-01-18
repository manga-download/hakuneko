import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Truktoon extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'truktoon';
        super.label = 'Truktoon';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://turktoon.com';
        this.path = '/manga/?list';
    }
}