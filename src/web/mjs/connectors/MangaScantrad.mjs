import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaScantrad extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga-scantrad';
        super.label = 'Manga-Scantrad';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://manga-scantrad.net';
    }
}