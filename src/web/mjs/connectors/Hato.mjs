import FlatManga from './templates/FlatManga.mjs';

export default class Hato extends FlatManga {

    constructor() {
        super();
        super.id = 'hato';
        super.label = 'HATO';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://mangahato.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}