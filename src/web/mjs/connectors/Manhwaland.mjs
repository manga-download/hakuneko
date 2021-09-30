import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Manhwaland extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwaland';
        super.label = 'Manhwaland';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwaland.me';
        this.path = '/series/list-mode/';
    }

    async _getMangaFromURI(uri) {
        const manga = await super._getMangaFromURI(uri);
        manga.title = manga.title.replace(/^(manga|manhwa|manhua)/i, '').trim();
        return manga;
    }
}