import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WordHero extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'wordhero';
        super.label = 'WordHero';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://wordhero.my.id';
        this.path = '/manga/list-mode/';
    }

}