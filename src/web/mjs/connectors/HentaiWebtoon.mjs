import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HentaiWebtoon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hentaiwebtoon';
        super.label = 'Hentai Webtoon';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://hentaiwebtoon.com';
    }
}