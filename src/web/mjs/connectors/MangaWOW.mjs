import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWOW extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangawow';
        super.label = 'MangaWOW';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangawow.com';
    }
}