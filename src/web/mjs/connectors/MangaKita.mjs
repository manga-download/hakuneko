import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaKita extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakita';
        super.label = 'MangaKita';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakita.net';
        this.path = '/daftar-manga/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
        this.queryChaptersTitle = undefined;
    }
}