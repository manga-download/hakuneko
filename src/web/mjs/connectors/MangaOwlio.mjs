import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaOwlio extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaowlio';
        super.label = 'MangaOwl.io';
        this.tags = ['webtoon', 'english', 'manga' ];
        this.url = 'https://mangaowl.io';
    }

}
