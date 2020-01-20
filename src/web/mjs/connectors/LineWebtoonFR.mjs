import LineWebtoon from './templates/LineWebtoon.mjs';

export default class LineWebtoonFR extends LineWebtoon {

    constructor() {
        super();
        super.id = 'linewebtoon-fr';
        super.label = 'Line Webtoon (French)';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://www.webtoons.com/fr';
    }
}