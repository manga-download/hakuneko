import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWorth extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaworth';
        super.label = 'Manga Worth';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://mangaworth.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}