import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaOkur extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaokur';
        super.label = 'Manga Okur';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.mangaokur.com';
    }
}