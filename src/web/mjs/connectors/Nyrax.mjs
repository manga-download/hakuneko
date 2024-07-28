import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Nyrax extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'nyrax';
        super.label = 'Nyrax';
        this.tags = ['webtoon', 'english', 'scanlation'];
        this.url = 'https://nyraxmanga.com';
        this.path = '/manga/list-mode/';
    }
}