import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaShip extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaship';
        super.label = 'Manga Ship';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangaship.com';
    }
}