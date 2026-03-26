import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaStreamCC extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangastreamcc';
        super.label = 'MangaStream';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangastream.cc';
    }
}