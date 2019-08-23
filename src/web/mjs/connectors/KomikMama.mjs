import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class KomikMama extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikmama';
        super.label = 'Komikmama';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikmama.net';
        this.path = '/manga-list/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
    }
}