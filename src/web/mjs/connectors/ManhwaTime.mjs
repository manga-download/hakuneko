import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaTime extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwatime';
        super.label = 'Manhwa Time';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manhwatime.xyz';
        this.path = '/manhwa/?list';

        this.queryMangas = 'div.animepost div.animposx > a';
        this.queryChapters = 'div#chapter_list span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/Manhwa$/i, '').trim());
        return mangas;
    }

    async _getChapters(manga) {
        const chapters = await super._getChapters(manga);
        chapters.forEach(chapter => chapter.title = chapter.title.replace(/^Manhwa/i, '').trim());
        return chapters;
    }
}