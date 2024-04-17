import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ascalon extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'ascalon';
        super.label = 'Ascalon';
        this.tags = ['webtoon', 'english', 'scanlation'];
        this.url = 'https://ascalonscans.com';
        this.path = '/manga/list-mode/';
    }
}
