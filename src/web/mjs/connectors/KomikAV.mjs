import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class KomikAV extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikav';
        super.label = 'KomikAV';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikav.com';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}