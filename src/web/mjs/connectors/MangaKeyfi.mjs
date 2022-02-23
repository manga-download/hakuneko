import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKeyfi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakeyfi';
        super.label = 'Manga Keyfi';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://mangakeyfi.net';
    }
}
