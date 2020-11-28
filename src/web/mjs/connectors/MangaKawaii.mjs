import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaKawaii extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangakawaii';
        super.label = 'MangaKawaii';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.mangakawaii.com';

        this.queryMangas = 'ul.manga-list-text li a.alpha-link';
        this.queryChapters = 'table.table--manga tbody td.table__chapter a';
        this.queryPages = 'div#all source.img-fluid';
        this.language = 'fr';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/^\//, '').trim());
        return mangas;
    }
}