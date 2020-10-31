import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaReadCO extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangareadco';
        super.label = 'Manga Read';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangaread.co';
    }
}