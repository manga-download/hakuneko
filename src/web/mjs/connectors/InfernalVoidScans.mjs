import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class InfernalVoidScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'infernalvoidscans';
        super.label = 'InfernalVoidScans';
        this.tags = [ 'webtoon', 'scanlation', 'english' ];
        this.url = 'https://hivescans.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
