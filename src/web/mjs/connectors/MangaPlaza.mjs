import SpeedBinb from "./templates/SpeedBinb.mjs";
import Manga from '../engine/Manga.mjs';

export default class MangaPlaza extends SpeedBinb {

    constructor() {
        super();
        super.id = 'mangaplaza';
        super.label = 'MangaPlaza';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangaplaza.com';
        this.baseURL = 'https://reader.mangaplaza.com/speedreader';
        this.links = {
            login: 'https://mangaplaza.com/login'
        };
        this.apiPath = '/api';
        this.requestOptions.headers.set('x-cookie', 'mp_over18_agreement=ON');
        this.pageNoSelector = '.pages>:nth-last-child(2)>a';
    }

    async _getMangaFromURI(uri) {
        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchDOM(req, '#_title_nm');
        const id = uri.pathname.split('/')[2];
        const title = this._sanitizeMangaTitle(res[0].innerText.trim());
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/new', this.url);
        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchDOM(req, this.pageNoSelector);
        let pageCount = parseInt(res[0].text);

        for (let i = 1; i <= pageCount; i++) {
            mangaList = mangaList.concat(await this._getMangaListFromPage(uri.href, i));
        }

        return mangaList;
    }

    async _getMangaListFromPage(uri, page) {
        page = page || 1;
        uri = new URL(uri);
        uri.searchParams.set('page', page);
        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchDOM(req, '.resBox>li>.titleName>a');
        return res.map(e => {
            return {
                id: e.pathname.split('/')[2],
                title: this._sanitizeMangaTitleFromNewReleases(e.innerText.trim())
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const uri = new URL(`${this.apiPath}/title/content_list/`, this.url);
        uri.searchParams.set('title_id', manga.id);

        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchJSON(req);
        const pageBtn = this._querySelectorFromHtmlString(res.data.html_page, this.pageNoSelector);

        let pageCount = 1;
        if (pageBtn.length != 0) {
            pageCount = parseInt(pageBtn[0].text);
        }

        for (let i = 1; i <= pageCount; i++) {
            chapterList = chapterList.concat(await this._getChaptersFromPage(uri.href, i, manga.id));
        }

        return chapterList;
    }

    async _getChaptersFromPage(uri, page, mangaId) {
        page = page || 1;
        uri = new URL(uri);
        uri.searchParams.set('page', page);

        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchJSON(req);
        return this._querySelectorFromHtmlString(res.data.html_content, '.inner_table')
            .filter(e => e.querySelectorAll('a[href*="/reader/"]').length != 0)
            .map(e => {
                const btnList = e.querySelectorAll('a[href*="/reader/"]');
                const contentId = btnList[0].pathname.split('/')[2];

                let title = e.getElementsByClassName('titleName')[0].innerText.trim();
                let u0 = 0;
                if (btnList[0].pathname.includes('/preview/')) {
                    title += ' (Preview)';
                    u0 = 1;
                }

                return {
                    id: `?cid=${contentId}&u0=${u0}&u1=https%3A%2F%2Fmangaplaza.com%2Ftitle%2F${mangaId}%2F%3Forder%3Dup%26content_id%3D${contentId}`,
                    title: title,
                };
            });
    }

    _sanitizeMangaTitle(title) {
        const chapterReleaseStr = '<Chapter release>';
        return title.replace(chapterReleaseStr, '');
    }

    _sanitizeMangaTitleFromNewReleases(title) {
        const splitTitle = title.split(' ');
        splitTitle.splice(0, 1);
        return this._sanitizeMangaTitle(splitTitle.join(' '));
    }

    _querySelectorFromHtmlString(htmlStr, selector) {
        const dom = document.createElement('html');
        dom.innerHTML = htmlStr;
        return Array.from(dom.querySelectorAll(selector));
    }
}
