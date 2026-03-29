import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangahentai';
        super.label = 'Manga Hentai';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://mangahentai.me';
    }
}