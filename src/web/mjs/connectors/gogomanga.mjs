import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GogoManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'gogomanga';
        super.label = 'Gogomanga';
        this.tags = ['webtoon', 'english', 'manga'];
        this.url = 'https://gogomanga.org';
        this.path = '/manga/list-mode/';
    }
}
