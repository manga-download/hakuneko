import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AlkyoneScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'alkyonescans';
        super.label = 'Alkyone Scans';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://alkyonescans.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
