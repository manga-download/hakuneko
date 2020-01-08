import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MangaKid extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangakid';
        super.label = 'MangaKid';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakid.me';
        this.path = '/manga-lists/';
    }
}