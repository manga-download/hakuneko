import MangaEden from './templates/MangaEden.mjs';

/**
 *
 */
export default class MangaEdenIT extends MangaEden {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaeden-it';
        super.label = 'MangaEdenIT';
        this.tags = [ 'manga', 'italian' ];
        this.url = 'https://www.mangaeden.com';
        this.urlMangas = '/it/it-directory/';
    }
}