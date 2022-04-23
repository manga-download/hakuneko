import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EvaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'evascans';
        super.label = 'EvaScans';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://evascans.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}