import Guya from './templates/Guya.mjs';

export default class GuyaMoe extends Guya {

    constructor() {
        super();
        super.id = 'guyamoe';
        super.label = 'Guya.moe';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://guya.cubari.moe';
    }
}