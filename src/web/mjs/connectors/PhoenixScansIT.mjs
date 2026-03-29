import PizzaReader from './templates/PizzaReader.mjs';

export default class PhoenixScansIT extends PizzaReader {

    constructor() {
        super();
        super.id = 'phoenixscans-it';
        super.label = 'Phoenix Scans';
        this.tags = [ 'manga', 'italian', 'scanlation' ];
        this.url = 'https://phoenixscans.com';
    }
}