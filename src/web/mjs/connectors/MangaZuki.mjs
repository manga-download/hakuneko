import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaZuki extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki';
        super.label = 'Mangazuki';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://mangazuki.me';
    }
}