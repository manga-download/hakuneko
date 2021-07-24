import MangaToon from './templates/MangaToon.mjs';

export default class MangaToonTH extends MangaToon {

    constructor() {
        super();
        super.id = 'mangatoon-th';
        super.label = 'MangaToon (Thai)';
        this.tags = [ 'webtoon', 'thai' ];
        this.url = 'https://mangatoon.mobi/th';
        this.path = '/th/genre?page=';
    }
}