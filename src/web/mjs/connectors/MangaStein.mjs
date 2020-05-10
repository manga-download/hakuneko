import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaStein extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangastein';
        super.label = 'MangaStein';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangastein.com';
    }
}