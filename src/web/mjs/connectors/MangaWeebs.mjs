import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWeebs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaweebs';
        super.label = 'Manga Weebs';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://mangaweebs.in';
    }
}