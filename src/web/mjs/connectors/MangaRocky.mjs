import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRocky extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangarocky';
        super.label = 'Manga Rocky';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangarocky.com';
    }
}