import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaKawaii extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangakawaii';
        super.label = 'MangaKawaii';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.mangakawaii.net';

        this.queryMangas = 'ul.manga-list-text li a.alpha-link';
        this.queryChapters = 'table.table--manga tbody td.table__chapter a';
        this.queryPages = 'div.text-center source[loading="lazy"]';
        this.language = 'fr';
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/^\//, '').trim());
        return mangas;
    }

    async _getChapters(manga) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const chapters = [...document.querySelectorAll('table.table--manga tbody td.table__chapter a')].map(element => {
                            return {
                                id: element.pathname,
                                title: element.text.trim()
                            };
                        });
                        resolve(chapters);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}