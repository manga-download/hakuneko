import Genkan from './templates/Genkan.mjs';

export default class ZeroScans extends Genkan {

    constructor() {
        super();
        super.id = 'zeroscans';
        super.label = 'ZeroScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://zeroscans.com';
    }
}