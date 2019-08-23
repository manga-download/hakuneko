import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class MaID extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'maid';
        super.label = 'MAID';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.maid.my.id';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.contentpost div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div#readerarea :not(.kln) > source';
    }
}