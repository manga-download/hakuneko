import MangaNel from './MangaNel.mjs';

export default class MangaNeloInfo extends MangaNel {

    constructor() {
        super();
        super.id = 'manganeloinfo';
        super.label = 'MangaNeloInfo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganelo.info/';

        this.path = '/genre';
        this.queryMangaTitle = 'section div.flex div.grow h1';
        this.queryMangasPageCount = 'body';
        this.queryMangas = 'main div.gap-4 div.gap-y-3 div.space-y-3 div.grid div.gap-2 div.overflow-hidden h3 a';
        // NOTE: a corresponding entry for chapter/page queries must be defined in the base class (required for cross-domain-support)
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL(this.path, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].innerHTML.match(/totalPage.+\d+,/)[0].match(/\d+/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    canHandleURI(uri) {
        // Test: https://regex101.com/r/aPR3zy/3/tests
        return /manganelo\.info$/.test(uri.hostname);
    }
}