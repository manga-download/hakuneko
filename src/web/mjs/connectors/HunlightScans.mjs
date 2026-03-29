import Genkan from './templates/Genkan.mjs';

/**
 *
 */
export default class HunlightScans extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hunlightscans';
        super.label = 'Hunlight Scans';
        this.tags = [ 'manga', 'webtoon', 'english', 'high-quality', 'scanlation' ];
        this.url = 'https://hunlight-scans.info';
    }
}