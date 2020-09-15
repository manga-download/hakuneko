import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaTopya extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangatopya';
        super.label = 'MangaTopya';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangatopya.com';
    }
}