import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Katakomik extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'katakomik';
        super.label = 'Katakomik';
        this.tags = ['webtoon', 'indonesian'];
        this.url = 'https://katakomik.my.id';
        this.path = '/manga/list-mode/';
    }
}
