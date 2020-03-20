import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaLord extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalord';
        super.label = 'Manga Lord';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.mangalord.com';
    }
}