import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaBilgini extends WordPressMadara {

    constructor() {
        super();
        super.id = 'morpheusfansub';
        super.label = 'Manga Bilgini';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangabilgini.com';

        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
        this.queryChapters = 'li[class*=wp-manga-chapter-] > a';
    }
}