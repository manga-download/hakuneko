import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EvaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'evascans';
        super.label = 'ManWe';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://manwe.pro';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
