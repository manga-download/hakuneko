import LineWebtoon from './templates/LineWebtoon.mjs';

export default class LineWebtoonEN extends LineWebtoon {

    constructor() {
        super();
        super.id = 'linewebtoon-de';
        super.label = 'Line Webtoon (German)';
        this.tags = [ 'webtoon', 'german' ];
        this.url = 'https://www.webtoons.com/de';
    }
}