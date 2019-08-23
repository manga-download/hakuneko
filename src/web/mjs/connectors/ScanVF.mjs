import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class ScanVF extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'scanvf';
        super.label = 'Scan VF';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.scan-vf.co';
    }
}