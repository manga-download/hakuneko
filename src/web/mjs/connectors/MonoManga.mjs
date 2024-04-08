import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MonoManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'monomanga';
        super.label = 'MonoManga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://monomanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/Bahasa Indonesia$/i, '').trim());
        return mangas;
    }
}
