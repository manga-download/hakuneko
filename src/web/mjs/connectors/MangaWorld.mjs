import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaworld';
        super.label = 'Manga World';
        this.tags = [ 'manga', 'webtoon', 'italian'];
        this.url = 'https://mangaworld.tv';
    }

}