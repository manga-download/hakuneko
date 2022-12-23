import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaindoMe extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaindoMe';
        super.label = 'MangaindoMe';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://mangaindo.me';
        this.path = '/manga/list-mode/';
    }
}
