import Tappytoon from './templates/Tappytoon.mjs';

export default class TappytoonFR extends Tappytoon {

    constructor() {
        super();
        super.id = 'tappytoon-fr';
        super.label = 'Tappytoon (French)';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://www.tappytoon.com/fr';
        this.lang = 'fr';
    }
}