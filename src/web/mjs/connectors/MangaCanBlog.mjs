import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaCanBlog extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangacanblog';
        super.label = 'MangaCan Blog';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangacanblog.com';
        this.path = '/daftar-komik-manga-bahasa-indonesia.html';
        this.queryMangas = 'div.blix ul li a.series';
    }

}