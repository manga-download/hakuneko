import WordPressMadara from './templates/WordPressMadara.mjs';

// Affiliates: Manga MangaZukiOnline
export default class MangaZukiSite extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangazuki-site';
        super.label = 'MangaZukiSite';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangazuki.site';
    }
}