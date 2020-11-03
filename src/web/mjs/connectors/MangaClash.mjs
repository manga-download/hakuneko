import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaClash extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaclash';
        super.label = 'Manga Clash';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangaclash.com';
    }
}