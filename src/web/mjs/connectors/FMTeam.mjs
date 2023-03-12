import FoolSlide from './templates/FoolSlide.mjs';
export default class FMTeam extends FoolSlide {

    constructor() {
        super();
        super.id = 'fmteam';
        super.label = 'fmteam';
        this.tags = [ 'manga', 'high-quality', 'french', 'scanlation' ];
        this.url = 'https://fmteam.fr';
        //this.path = '/directory/';
        this.language = 'french';
    }
}
