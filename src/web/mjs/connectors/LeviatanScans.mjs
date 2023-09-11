import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeviatanScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leviatanscans';
        super.label = 'LeviatanScans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://lscomic.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }
}
