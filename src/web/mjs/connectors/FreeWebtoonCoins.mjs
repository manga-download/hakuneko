import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FreeWebtoonCoins extends WordPressMadara {

    constructor() {
        super();
        super.id = 'freewebtooncoins';
        super.label = 'Free Webtoon Coins';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://freewebtooncoins.com';
    }
}