import FlatManga from './templates/FlatManga.mjs';

/**
 *
 */
export default class LHScan extends FlatManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lhscan';
        super.label = 'LHScan';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'http://lhscan.net';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}