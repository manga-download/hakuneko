import FlatManga from './templates/FlatManga.mjs';

export default class TruyenTranhLH extends FlatManga {

    constructor() {
        super();
        super.id = 'truyentranhlh';
        super.label = 'TruyenTranhLH';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://truyentranhlh.net';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}