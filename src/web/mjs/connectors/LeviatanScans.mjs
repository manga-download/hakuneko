import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeviatanScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leviatanscans';
        super.label = 'LeviatanScans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://en.leviatanscans.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/ranking/page/${page}/`, this.url), this.requestOptions);
    }
}
