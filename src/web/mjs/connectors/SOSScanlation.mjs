import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class SOSScanlation extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'sosscanlation';
        super.label = 'SOSScanlation';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://sosscanlation.com';
    }
}