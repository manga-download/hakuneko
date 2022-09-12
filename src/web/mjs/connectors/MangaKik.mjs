import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKik extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakik';
        super.label = 'MangaKik';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangakik.net';
    }
}