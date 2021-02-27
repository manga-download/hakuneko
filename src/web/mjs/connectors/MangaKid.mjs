import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaKid extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakid';
        super.label = 'MangaKid';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakid.club';
        this.path = '/manga-lists/';

        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryChaptersTitle = undefined;
    }
}
