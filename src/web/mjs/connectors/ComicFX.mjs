import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class ComicFX extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'comicfx';
        super.label = 'Comic FX';
        this.tags = [ 'manga', 'webtoon', 'english', 'indonesian' ];
        this.url = 'https://comicfx.net';

        this.queryMangas = 'ul.manga-list li a';
        this.queryChapters = 'div.chaplist ul li a:not([class])';
        this.queryPages = 'div#all source.img-responsive';
        this.language = 'id';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/^manga\s*/i, ''));
        return mangas;
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => {
                const images = link_canx.map(link => {
                    const url = atob(link.split('').reverse().join('')).replace(/i\\d*\\.wp\\.com\\//, '');
                    const uri = new URL(url, window.location.href);
                    uri.search = '';
                    return uri.href;
                });
                resolve(images);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }
}