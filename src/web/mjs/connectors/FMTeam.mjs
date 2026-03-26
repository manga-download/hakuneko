import PizzaReader from './templates/PizzaReader.mjs';

export default class FMTeam extends PizzaReader {

    constructor() {
        super();
        super.id = 'fmteam';
        super.label = 'fmteam';
        this.tags = [ 'manga', 'high-quality', 'french', 'scanlation' ];
        this.url = 'https://fmteam.fr';
    }
}
