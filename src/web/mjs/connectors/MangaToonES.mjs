import MangaToon from './templates/MangaToon.mjs';

/**
 *
 */
export default class MangaToonES extends MangaToon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatoon-es';
        super.label = 'MangaToon (Spanish)';
        this.tags = [ 'webtoon', 'spanish' ];
        this.path = '/es/genre?page=';
    }
}