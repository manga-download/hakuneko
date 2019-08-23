import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 * Is this really a WordPressEManga theme?
 * Same as OtakuIndo
 */
export default class Komiku extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komiku';
        super.label = 'Komiku';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komiku.co';
        this.path = '/daftar-komik/?list';

        this.queryMangas = 'div#animelist ol li h4 a';
        this.queryChapters = 'div#list table.chapter tr td.judulseries a';
        this.queryPages = 'div#readerareaimg source[src]:not([src=""])';
    }
}