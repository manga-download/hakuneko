import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaArabics extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaarabics';
        super.label = 'MangaArabics';
        this.tags = [ 'manga', 'arabic', 'webtoon' ];
        this.url = 'https://mangaarabics.com';
    }
}