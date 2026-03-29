import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GloryScansTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'glory-scans';
        super.label = 'Glory-Scans';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://gloryscans.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}