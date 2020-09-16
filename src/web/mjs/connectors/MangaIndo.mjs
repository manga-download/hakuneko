import WordPressMangastream from './templates/WordPressMangastream.mjs';

/**
 *
 */
export default class MangaIndo extends WordPressMangastream {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangaindo';
        super.label = 'MangaIndo';
        this.tags = [ 'manga', 'indonesian' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangaindo.net';
        this.path = '/manga-list/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
    }
}