import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikCast extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast02.com';

        this.querMangaTitleFromURI = 'h1.komik_info-content-body-title';
        this.queryMangas = 'div.list-update_item';
        this.queryChapters = 'div.komik_info-chapters ul li.komik_info-chapters-item a.chapter-link-item';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.main-reading-area img';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _initializeConnector() {
        // do nothing on purpose
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/daftar-komik/page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas );
        return data.map(element => {
            return {
                id: element.querySelector('a').pathname,
                title: element.querySelector('h3.title').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.main-reading-area source.alignnone, div.separator source.alignnone');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}
