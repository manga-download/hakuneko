import ReaderFront from './templates/ReaderFront.mjs';

export default class ScyllaScans extends ReaderFront {

    constructor() {
        super();
        super.id = 'scyllascans';
        super.label = 'Scylla Scans';
        this.tags = [ 'manga', 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://scyllascans.org';
        this.cdn = 'https://api.scyllascans.org';
        this.apiURL = 'https://api.scyllascans.org';
        this.language = 'en';
        this.requestOptions.headers.set('accept', '*/*');
    }
}
