import MangaNel from './MangaNel.mjs';

export default class MangaBat extends MangaNel {

    constructor() {
        super();
        super.id = 'mangabat';
        super.label = 'MangaBat';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangabats.com';
    }
}
