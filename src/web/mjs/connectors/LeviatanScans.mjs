import Genkan from './templates/Genkan.mjs';

/**
 *
 */
export default class LeviatanScans extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'leviatanscans';
        super.label = 'LeviatanScans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://leviatanscans.com';
    }
}