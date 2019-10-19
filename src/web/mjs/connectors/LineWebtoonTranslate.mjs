import LineWebtoon from './templates/LineWebtoon.mjs';

export default class LineWebtoonTranslate extends LineWebtoon {

    constructor() {
        super();
        super.id = 'linewebtoon-translate';
        super.label = 'Line Webtoon (Translate)';
        this.tags = [ 'webtoon', 'scanlation', 'multi-lingual' ];
        this.url = 'https://translate.webtoons.com';
        this.baseURL = 'https://translate.webtoons.com';
        this.requestOptions.headers.set('x-referer', this.baseURL);
    }
}