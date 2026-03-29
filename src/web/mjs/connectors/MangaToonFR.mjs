import MangaToon from './templates/MangaToon.mjs';

export default class MangaToonTH extends MangaToon {

    constructor() {
        super();
        super.id = 'mangatoon-fr';
        super.label = 'MangaToon (French)';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://mangatoon.mobi/fr';
        this.path = '/fr/genre/comic?page=';
    }
}