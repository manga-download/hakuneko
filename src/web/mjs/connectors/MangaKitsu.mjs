import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKitsu extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakitsu';
        super.label = 'Manga Kitsu';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangakitsu.com';
    }
}