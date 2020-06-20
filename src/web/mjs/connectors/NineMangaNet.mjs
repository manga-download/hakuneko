import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class NineMangaNet extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'ninemanganet';
        super.label = 'Ninemanga.net';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://ninemanga.net';

        this.language = 'es';
    }
}