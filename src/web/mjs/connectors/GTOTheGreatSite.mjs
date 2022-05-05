import PizzaReader from './templates/PizzaReader.mjs';

export default class GTOTheGreatSite extends PizzaReader {

    constructor() {
        super();
        super.id = 'gtotgs';
        super.label = 'GTO The Great Site';
        this.tags = [ 'manga', 'italian', 'scanlation' ];
        this.url = 'https://reader.gtothegreatsite.net';
    }
}