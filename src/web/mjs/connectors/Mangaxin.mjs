import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class MangaXin extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaceng';
        super.label = 'Mangaxin';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://mangaxin.com';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.listpst div.listttl > ul li a';
        this.queryChapters = 'div.epsleft a';
    }
}