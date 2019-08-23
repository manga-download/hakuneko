import LineWebtoon from './templates/LineWebtoon.mjs';

/**
 *
 */
export default class LineWebtoonZH extends LineWebtoon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'linewebtoon-zh'; // zh-hant
        super.label = 'Line Webtoon (Chinese)'; // Chinese Traditional
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.webtoons.com/zh';
    }
}