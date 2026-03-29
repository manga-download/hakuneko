import LineWebtoon from './templates/LineWebtoon.mjs';

/**
 *
 */
export default class LineWebtoonTH extends LineWebtoon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'linewebtoon-th';
        super.label = 'Line Webtoon (Thai)';
        this.tags = [ 'webtoon', 'thai' ];
        this.url = 'https://www.webtoons.com/th';
    }
}