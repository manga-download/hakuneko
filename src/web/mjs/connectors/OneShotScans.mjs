import Genkan from './templates/Genkan.mjs';

/**
 *
 */
export default class OneShotScans extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'oneshotscans';
        super.label = 'One Shot Scans';
        this.tags = [ 'webtoon', 'english', 'high-quality', 'scanlation' ];
        this.url = 'https://oneshotscans.com';
    }
}