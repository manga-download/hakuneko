import LineWebtoon from './templates/LineWebtoon.mjs';

/**
 *
 */
export default class LineWebtoonID extends LineWebtoon {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'linewebtoon-id';
        super.label = 'Line Webtoon (Indonesian)';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://www.webtoons.com/id';
    }
}