import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaOkuTr extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaokutr';
        super.label = 'Manga Oku TR';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangaokutr.com';
        this.path = '/manga/list-mode/';
    }
}