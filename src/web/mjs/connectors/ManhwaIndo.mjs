import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaIndo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwaindo';
        super.label = 'ManhwaIndo';
        this.tags = ['webtoon', 'indonesian'];
        this.url = 'https://manhwaindo.com';
        this.path = '/series/list-mode/';
    }
}