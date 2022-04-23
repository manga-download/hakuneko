import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AresManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'aresmanga';
        super.label = 'Ares Manga';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://aresmanga.com';
        this.path = '/manga/list-mode/';
    }
}