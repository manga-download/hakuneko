import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class RawMangaSite extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'rawmangasite';
        super.label = 'RawMangaSite';
        this.tags = [ 'manga', 'high-quality', 'raw' ];
        this.url = 'https://rawmanga.site';
    }
}