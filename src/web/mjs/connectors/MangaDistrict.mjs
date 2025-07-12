import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDistrict extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadistrict';
        super.label = 'mangadistrict';
        this.tags = [ 'manhwa','Webtoon', 'english' ];
        this.url = 'https://mangadistrict.com';
        this.queryTitleForURI = "div.post-title > h1";
    }
}