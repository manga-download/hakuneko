import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ShimadaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shimadascans';
        super.label = 'Shimadascans';
        this.tags = [ 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://shimadascans.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}