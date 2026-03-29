import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaSepeti extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangasepeti';
        super.label = 'Manga Sepeti';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangasepeti.com';
    }
}