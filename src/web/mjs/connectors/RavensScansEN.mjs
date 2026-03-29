import ReaderFront from './templates/ReaderFront.mjs';

export default class RavensScansEN extends ReaderFront {

    constructor() {
        super();
        super.id = 'ravensscans-en';
        super.label = 'RavensScans (English)';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://ravens-scans.com';
        this.cdn = 'https://img-cdn1.ravens-scans.com';
        this.apiURL = 'https://api.ravens-scans.com';
        this.language = 'en';
        this.requestOptions.headers.set('accept', '*/*');
    }

    canHandleURI(uri) {
        return uri.origin === this.url && uri.pathname.includes('/en/');
    }
}