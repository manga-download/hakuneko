import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class PhoenixScans extends MangaReaderCMS {
    constructor() {
        super();
        super.id = 'phoenix-scans';
        super.label = 'Phoenix-Scans';
        this.tags = [ 'manga', 'high-quality', 'polish', 'scanlation' ];
        this.url = 'http://phoenix-scans.pl';

        this.language = 'pl';
    }
}