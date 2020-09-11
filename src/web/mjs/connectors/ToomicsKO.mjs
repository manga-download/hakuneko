import Toomics from './templates/Toomics.mjs';

export default class ToomicsKO extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-ko';
        super.label = 'Toomics (Korean)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://www.toomics.com';
        this.baseURL = 'https://www.toomics.com';
        this.requestOptions.headers.set('x-cookie', 'content_lang=ko');

        this.path = [ '/webtoon/weekly', '/webtoon/finish/ord/latest' ];
        this.queryMangaHeading = 'div.episode__header h2.episode__title';
        this.queryMangas = 'li.grid__li a.toon-dcard';
        this.queryMangaTitle = 'div.toon-dcard__caption strong.toon-dcard__title';
        this.queryChapters = 'div.episode__body ul.eps li.eps__li:not(.chk_ep) a';
        this.queryChapterNumber = 'div.ep__episode';
        this.queryChapterFilterInclude = 'div.ep__caption';
        this.queryChapterFilterExclude = 'span.ep__bill i.sp-icon2__b-coin';
        this.queryPages = 'div.viewer__img source';
    }

    async _getMangas() {
        let mangaList = [];
        for(let path of this.path) {
            for(let page = 1, run = true; run; page++) {
                let mangas = await this._getMangasFromPage(path, page);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        let uri = new URL(path, this.baseURL);
        let request = new Request(uri, {
            method: 'POST',
            body: new URLSearchParams({ page: page, load_contents: 'Y' }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.baseURL).replace(/bridge\/type\/\d+/, 'episode'),
                title: element.querySelector(this.queryMangaTitle).innerText.trim()
            };
        });
    }
}