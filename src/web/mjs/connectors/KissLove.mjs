import FlatManga from './templates/FlatManga.mjs';

export default class KissLove extends FlatManga {

    constructor() {
        super();
        super.id = 'kisslove';
        super.label = 'KissLove';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://kisslove.net';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}