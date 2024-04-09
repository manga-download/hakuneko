import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MonzeeKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'monzeekomik';
        super.label = 'MonzeeKomik';
        this.tags = ['manga', 'manhwa', 'indonesian'];
        this.url = 'https://monzeekomik.my.id';
        this.path = '/manga/list-mode/';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/Bahasa Indonesia$/i, '').trim());
        return mangas;
    }
}
