import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaGecesi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangagecesi';
        super.label = 'Manga Gecesi';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangagecesi.com';
    }
}