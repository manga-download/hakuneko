import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class MangaKita extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangakita';
        super.label = 'MangaKita';
        this.tags = [ 'manga', 'indonesian' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangakita.net';
        this.path = '/manga-list/';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.series';
        this.queryChapters = 'div.chapter-list span.chapterLabel:first-of-type a';
    }
}