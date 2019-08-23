import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaZukiInfo extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki-info';
        super.label = 'Mangazuki';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://mangazuki.info';
    }
}