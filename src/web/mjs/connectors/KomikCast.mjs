import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikCast extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast.com';
        this.path = '/daftar-komik/?list';

        this.queryMangas = 'div.text-mode_list-items ul li a.series';
        this.queryChapters = 'div.komik_info-chapters ul li.komik_info-chapters-item a.chapter-link-item';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.main-reading-area img[src^="http"], div.separator img[src^="http"]';
    }
}