import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class TitanManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'titanmanga';
        super.label = 'Titan Manga';
        this.tags = [ 'manga', 'turkish', 'webtoon' ];
        this.url = 'https://titanmanga.com';
        this.path = '/manga/list-mode/';
    }
}