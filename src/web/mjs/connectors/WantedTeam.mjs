import FoolSlide from './templates/FoolSlide.mjs';

export default class WantedTeam extends FoolSlide {

    constructor() {
        super();
        super.id = 'wantedteam';
        super.label = 'Wanted Team';
        this.tags = ['manga', 'polish', 'scanlation'];
        this.url = 'http://reader.onepiecenakama.pl';
    }
}