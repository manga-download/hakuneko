import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaKita extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakita';
        super.label = 'MangaKita';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakita.net';
        this.path = '/daftar-manga/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.series';
        this.queryChapters = 'div.chapter-list span.chapterLabel:first-of-type a';
    }
}