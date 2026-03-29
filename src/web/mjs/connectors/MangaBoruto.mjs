import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaBoruto extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaboruto';
        super.label = 'Manga Boruto';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://sensibleiowans.org';
        this.path = '/manga/list-mode/';
    }
}