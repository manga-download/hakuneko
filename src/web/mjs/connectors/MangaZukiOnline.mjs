import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaZukiOnline extends WordPressMadara {

    /**
     * Affiliates: Manga MangaZukiSite
     */
    constructor() {
        super();
        super.id = 'mangazuki-online';
        super.label = 'MangaZukiOnline';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangazuki.online';
    }
}