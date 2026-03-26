import Guya from './templates/Guya.mjs';

export default class DankeFursLesen extends Guya {

    constructor() {
        super();
        super.id = 'dankefurslesen';
        super.label = 'Danke fürs Lesen';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://danke.moe';
    }
}