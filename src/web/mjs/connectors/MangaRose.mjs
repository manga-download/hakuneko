import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRose extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangarose';
        super.label = 'MangaRose';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangarose.com';
    }
}