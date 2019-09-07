import Genkan from './templates/Genkan.mjs';

export default class WoweScans extends Genkan {

    constructor() {
        super();
        super.id = 'wowescans';
        super.label = 'Wowe Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://wowescans.co';
    }
}