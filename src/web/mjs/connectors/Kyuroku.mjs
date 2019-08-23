import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class Kyuroku extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kyuroku';
        super.label = 'Kyuroku';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kyuroku.com';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}