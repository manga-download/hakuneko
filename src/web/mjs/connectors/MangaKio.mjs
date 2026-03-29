import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKio extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakio';
        super.label = 'Manga Kio';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://mangakio.com';
    }
}