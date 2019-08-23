import FlatManga from './templates/FlatManga.mjs';

/**
 *
 */
export default class RawLH extends FlatManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'rawlh';
        super.label = 'RawLH';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://lhscan.net';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}