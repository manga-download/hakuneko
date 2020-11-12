import VerComicsPorno from './VerComicsPorno.mjs';

export default class VerMangasPorno extends VerComicsPorno {

    constructor() {
        super();
        super.id = 'vermangasporno';
        super.label = 'VerMangasPorno';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'https://vermangasporno.com';

        this.listPages = 'div.comicimg source:not([src*="banner.png"])';
    }
}