import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaReaderPro extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangareaderpro';
        super.label = 'MangaReaderPro';
        this.tags = [ 'manga', 'spanish', 'webtoon' ];
        this.url = 'https://mangareaderpro.com';
    }
}