import Leitor from './Leitor.mjs';

export default class MangaLivre extends Leitor {

    constructor() {
        super();
        super.id = 'mangalivre';
        super.label = 'Manga Livre';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://mangalivre.net';
    }
}