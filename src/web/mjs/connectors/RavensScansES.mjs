import ReaderFront from './templates/ReaderFront.mjs';

export default class RavensScansES extends ReaderFront {

    constructor() {
        super();
        super.id = 'ravensscans-es';
        super.label = 'RavensScans (Spanish)';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://ravens-scans.com';
        this.cdn = 'https://img-cdn1.ravens-scans.com';
        this.apiURL = 'https://api.ravens-scans.com';
        this.language = 'es';
        this.requestOptions.headers.set('accept', '*/*');
    }

    canHandleURI(uri) {
        return uri.origin === this.url && uri.pathname.includes('/es/');
    }
}