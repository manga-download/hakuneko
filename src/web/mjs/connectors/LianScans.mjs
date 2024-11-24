import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LianScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lianscans';
        super.label = 'LIAN';
        this.tags = [ 'manga', 'indonesian', 'scanlation' ];
        this.url = 'https://www.lianscans.my.id';
        this.path = '/manga/';

        this.queryMangas = 'div.listupd div.bs div.bsx > a';
        this.queryChapters = 'div.eplister div.chbox div.eph-num a';
        this.queryPages = 'div.readerarea img[src]:not([src=""])';
        this.queryChaptersTitle = 'div.eplister div.chbox div.eph-num a span.chapternum';
        this.querMangaTitleFromURI = 'div.infox h1.entry-title';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga/?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}
