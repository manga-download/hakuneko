import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRow extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangarow';
        super.label = 'MangaRow';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.mangarow.com';
    }
}