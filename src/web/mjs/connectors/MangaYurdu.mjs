import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaYurdu extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangayurdu';
        super.label = 'Manga Yurdu';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangayurdu.com';
    }
}