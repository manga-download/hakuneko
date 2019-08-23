import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class Mangaceng extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaceng';
        super.label = 'Mangaceng';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://mangaceng.com';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}