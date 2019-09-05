import MangaToon from './templates/MangaToon.mjs';

/**
 *
 */
export default class MangaToonVI extends MangaToon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatoon-vi';
        super.label = 'MangaToon (Vietnamese)';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://mangatoon.mobi/vi';
        this.path = '/vi/genre?page=';
    }
}