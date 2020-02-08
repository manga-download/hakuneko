import MangaToon from './templates/MangaToon.mjs';

export default class MangaToonEN extends MangaToon {

    constructor() {
        super();
        super.id = 'mangatoon-pt';
        super.label = 'MangaToon (Portuguese)';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://mangatoon.mobi/pt';
        this.path = '/pt/genre?page=';
    }
}