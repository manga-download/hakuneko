import Genkan from './templates/Genkan.mjs';

/**
 *
 */
export default class KomiScans extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komiscans';
        super.label = 'Komi Scans';
        this.tags = [ 'manga', 'english', 'high-quality', 'scanlation' ];
        this.url = 'https://komiscans.com';
    }
}