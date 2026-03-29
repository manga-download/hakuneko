import MangaHub from './MangaHub.mjs';

/**
 *
 */
export default class MangaReaderSite extends MangaHub {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangareadersite';
        super.label = 'MangaReaderSite';
        this.url = 'https://mangareader.site';

        this.path = 'mr01';
    }
}