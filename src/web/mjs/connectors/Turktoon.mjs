import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Turktoon extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'turktoon';
        super.label = 'Turktoon';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://turktoon.com';
        this.path = '/manga/?list';
    }
}