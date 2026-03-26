import LineWebtoon from './templates/LineWebtoon.mjs';

/**
 *
 */
export default class LineWebtoonEN extends LineWebtoon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'linewebtoon-en';
        super.label = 'Line Webtoon (English)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.webtoons.com/en';
    }
}