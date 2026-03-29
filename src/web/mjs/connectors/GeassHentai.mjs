import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GeassHentai extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'geasshentai';
        super.label = 'Geass Hentai';
        this.tags = [ 'webtoon', 'hentai', 'portuguese' ];
        this.url = 'https://geassscan.xyz/';
        this.path = '/manga/list-mode/';
    }
}