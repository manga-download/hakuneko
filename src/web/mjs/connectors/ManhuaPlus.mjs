import TruyenChon from './TruyenChon.mjs';

export default class ManhuaPlus extends TruyenChon {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://manhuaplus.com';
    }
}