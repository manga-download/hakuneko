import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class LELScanVF extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lelscanvf';
        super.label = 'LELSCAN-VF';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.lelscan-vf.com';
    }
}