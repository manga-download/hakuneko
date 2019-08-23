import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class ScanOP extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'scanop';
        super.label = 'Scan OP';
        this.tags = [ 'manga', 'french' ];
        this.url = 'http://www.scan-op.com';
    }
}