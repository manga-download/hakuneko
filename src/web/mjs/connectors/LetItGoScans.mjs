import ComiCake from './templates/ComiCake.mjs';

/**
 *
 */
export default class LetItGoScans extends ComiCake {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'letitgoscans';
        super.label = 'LetItGoScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.letitgo.scans.today';
    }
}