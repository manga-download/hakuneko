import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class Puzzmos extends MangaReaderCMS {
    constructor() {
        super();
        super.id = 'puzzmos';
        super.label = 'Puzzmos';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://puzzmos.com';
        this.language = 'tr';
    }
}