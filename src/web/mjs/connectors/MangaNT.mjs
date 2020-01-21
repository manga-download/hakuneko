import TruyenChon from './TruyenChon.mjs';

export default class MangaNT extends TruyenChon {

    constructor() {
        super();
        super.id = 'mangant';
        super.label = 'MangaNT';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangant.com';
    }
}