import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class ScanFR extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'scanfr';
        super.label = 'Scan FR';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.scan-fr.org';

        this.queryChapters = 'ul.chapterszozo li a';
        this.language = 'fr';
    }
}
