import WordPressMadara from './templates/WordPressMadara.mjs';

// Affiliates: Manga MangaZukiSite
export default class MangaZukiOnline extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangazuki-online';
        super.label = 'MangaZukiOnline';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangazuki.online';
    }
}