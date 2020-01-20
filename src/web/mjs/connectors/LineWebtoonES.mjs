import LineWebtoon from './templates/LineWebtoon.mjs';

export default class LineWebtoonES extends LineWebtoon {

    constructor() {
        super();
        super.id = 'linewebtoon-es';
        super.label = 'Line Webtoon (Spanish)';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://www.webtoons.com/es';
    }
}