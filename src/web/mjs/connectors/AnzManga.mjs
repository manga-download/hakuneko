import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class AnzManga extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'anzmanga';
        super.label = 'AnzManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://www.anzmangashd.com';

        this.language = 'es';
    }
}