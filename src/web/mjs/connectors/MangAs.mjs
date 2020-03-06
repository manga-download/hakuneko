import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangAs extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangas';
        super.label = 'MangAs';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://mangas.in';

        this.language = 'es';
    }
}