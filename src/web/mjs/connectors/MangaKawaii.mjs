import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaKawaii extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangakawaii';
        super.label = 'MangaKawaii';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.mangakawaii.to';

        this.queryMangas = 'ul.manga-list-text li a.alpha-link';
        this.queryChapters = 'div.chapters-list div.chapter-item div.chapter-item__name a.list-item__title';
        this.language = 'fr';
    }
}