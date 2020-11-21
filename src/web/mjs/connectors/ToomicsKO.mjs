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

        this.path = [ '/webtoon/weekly', '/webtoon/finish/ord/latest', '/popular/popular_list/cut_type/P/ord/update' ];
        this.queryMangaHeading = 'div.episode__header h2.episode__title';
        this.queryMangas = 'li[class*="__li"] > a[class*="toon"]';
        this.queryMangaTitle = 'div.toon-dcard__caption strong.toon-dcard__title, div.toon__caption span.toon__subtitle';
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
        // the popular list contains many duplicates (not detectable by ID) which needs to be removed
        return mangaList.filter((manga, index) => index === mangaList.findIndex(m => m.title === manga.title));
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
                id: element.dataset.toggle === 'modal' ? element.id.match(/idx(\d+)$/)[1] : this.getRootRelativeOrAbsoluteLink(element, this.baseURL).replace(/bridge\/type\/\d+/, 'episode'),
                title: element.querySelector(this.queryMangaTitle).textContent.replace(/\u005B[^\u005B\u005D]+\u005D$/, '').trim()
            };
        });
    }

    async _fetchPOST(path, data, responseMethodName) {
        const uri = new URL(path, this.url);
        const request = new Request(uri, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data).toString()
        });
        const response = await fetch(request);
        return response[responseMethodName]();
    }

    async _getChapters(manga) {
        if(!isNaN(manga.id)) {
            let data = await this._fetchPOST('/popular/getCutPaging', {
                cut_idx: manga.id,
                cut_gender: '',
                cut_type: 'P',
                ord: 'update'
            }, 'json');
            data = await this._fetchPOST('/popular/getCutItem', {
                cut_idx: manga.id,
                history_idx: data.iInsertIdx,
                ord: 'update'
            }, 'text');
            manga.id = '/webtoon/episode/toon/' + data.match(/toon_idx\/(\d+)/)[1];
        }
        return super._getChapters(manga);
    }
}