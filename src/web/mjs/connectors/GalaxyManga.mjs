import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GalaxyManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'galaxymanga';
        super.label = 'Galaxy Manga';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://galaxymanga.org';
        this.path = '/manga/list-mode/';
    }
}