import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikCast extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast.cz';
        this.path = '/daftar-komik/?list';

        this.querMangaTitleFromURI = 'h1.komik_info-content-body-title';
        this.queryMangas = 'div.text-mode_list-items ul li a.series, div.text-mode_list-items ul li a.text-mode_list-item';
        this.queryChapters = 'div.komik_info-chapters ul li.komik_info-chapters-item a.chapter-link-item';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.main-reading-area img';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _initializeConnector() {
        // do nothing on purpose
    }

}
