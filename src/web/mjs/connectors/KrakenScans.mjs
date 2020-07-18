import Genkan from './templates/Genkan.mjs';

export default class KrakenScans extends Genkan {

    constructor() {
        super();
        super.id = 'krakenscans';
        super.label = 'Kraken Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://krakenscans.com';
    }
}