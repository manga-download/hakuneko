import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class KirishimaFansub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'kirishimafansub';
        super.label = 'KirishimaFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.kirishimafansub.net';
        this.path = '/reader/';
        this.language = 'spanish';
    }
}