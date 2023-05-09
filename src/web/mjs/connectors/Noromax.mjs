import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Noromax extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'noromax';
        super.label = 'Noromax';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://noromax.my.id';
        this.path = '/Komik/list-mode/';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/Bahasa Indonesia$/i, '').trim());
        return mangas;
    }
}
