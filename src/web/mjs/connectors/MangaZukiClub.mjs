import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaZukiClub extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki-club';
        super.label = 'Mangazuki Raws';
        this.tags = [ 'manga', 'webtoon', 'high-quality', 'raw' ];
        this.url = 'https://mangazuki.club';
    }
}