import MangaToon from './templates/MangaToon.mjs';

/**
 *
 */
export default class MangaToonCN extends MangaToon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatoon-cn';
        super.label = 'MangaToon (Chinese)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://mangatoon.mobi/cn';
        this.path = '/cn/genre?page=';
    }
}