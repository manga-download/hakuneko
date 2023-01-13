import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSusuReborn extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangasusureborn';
        super.label = 'MangaSusu Reborn';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://92.84.132.251';
        this.path = '/az-list';

        this.queryMangas = 'div.listo div.bs div.bsx > a';
        this.queryChapters = 'div#chapterlist div.chbox div.eph-num a';
        this.queryPages = 'div#readerarea img[src]:not([src=""])';
        this.queryChaptersTitle = undefined;
        this.querMangaTitleFromURI = 'div.seriestucon div.seriestuheader h1.entry-title';
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
        const uri = new URL('/az-list/page/' + page, this.url);
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
