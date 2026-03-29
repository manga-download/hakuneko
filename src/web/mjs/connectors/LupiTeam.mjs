import PizzaReader from './templates/PizzaReader.mjs';

export default class LupiTeam extends PizzaReader {

    constructor() {
        super();
        super.id = 'lupiteam';
        super.label = 'LupiTeam';
        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];
        this.url = 'https://lupiteam.net';
    }
}