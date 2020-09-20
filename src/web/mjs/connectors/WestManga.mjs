import WordPressMangastream from './templates/WordPressMangastream.mjs';

/**
 *
 */
export default class WestManga extends WordPressMangastream {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'westmanga';
        super.label = 'WestManga';
        this.tags = [ 'manga', 'indonesian' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://westmanga.info';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.series';
    }
}