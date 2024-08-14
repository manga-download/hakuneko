import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Manhwax extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwax';
        super.label = 'Manhwax';
        this.tags = [ 'manga', 'english', 'webtoon', 'hentai'];
        this.path = '/manga/list-mode/';
        this.url = 'https://manhwax.org';
    }
}
