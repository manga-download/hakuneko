import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaZukiSite extends WordPressMadara {

    /**
     * Affiliates: Manga MangaZukiOnline
     */
    constructor() {
        super();
        super.id = 'mangazuki-site';
        super.label = 'MangaZukiSite';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangazuki.site';
    }
}