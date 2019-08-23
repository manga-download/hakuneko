import TruyenChon from './TruyenChon.mjs';

/**
 *
 */
export default class NetTruyen extends TruyenChon {

    /**
     * Same as TruyenChon
     */
    constructor() {
        super();
        super.id = 'nettruyen';
        super.label = 'NetTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://www.nettruyen.com';
    }
}