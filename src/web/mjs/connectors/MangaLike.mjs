import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaLike extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangalike';
        super.label = 'mangalike';
        this.tags = [ 'manga', 'english' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangalike.net';
    }
}