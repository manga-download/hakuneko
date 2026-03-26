import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaNetTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manganettr';
        super.label = 'MangaNetTR';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.manganettr.com';
    }
}