import SpeedBinb from "./templates/SpeedBinb.mjs";
import Manga from '../engine/Manga.mjs';

export default class MangaPlaza extends SpeedBinb {

    constructor() {
        super();
        super.id = 'mangaplaza';
        super.label = 'MangaPlaza';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangaplaza.com';
        this.apiUrl = 'https://mangaplaza.com/api';
        this.baseURL = 'https://reader.mangaplaza.com/speedreader';
        this.requestOptions.headers.set('x-cookie', 'mp_over18_agreement=ON');
        this.pageNoSelector = '.pages>:nth-last-child(2)>a';
        this.chapLnkTmpl = ['?cid=', '&u0=', '&u1=https%3A%2F%2Fmangaplaza.com%2Ftitle%2F', '%2F%3Forder%3Dup%26content_id%3D'];
        this.links = {
            login: 'https://mangaplaza.com/login'
        };
    }

    async _getMangaFromURI(uri) {
        let req = new Request(uri, this.requestOptions);
        let res = await this.fetchDOM(req, '#_title_nm');
        let id = uri.pathname.split('/')[2];
        let title = this._sanitizeMangaTitle(res[0].innerText.trim());
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let req = new Request(new URL(this.url + '/new?'), this.requestOptions);
        let res = await this.fetchDOM(req, this.pageNoSelector);
        let pageCount = parseInt(res[0].text);

        for (let i = 1; i <= pageCount; i++) {
            mangaList = mangaList.concat(await this._getMangaListFromPage(i));
        }

        return mangaList;
    }

    async _getMangaListFromPage(page) {
        page = page || 1;
        let req = new Request(new URL(this.url + '/new?page=' + page), this.requestOptions);
        let res = await this.fetchDOM(req, '.resBox>li>.titleName>a');
        return res.map(e => {
            return {
                id: e.pathname.split('/')[2],
                title: this._sanitizeMangaTitleFromNewReleases(e.innerText.trim())
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let pageCount = 1;
        const uri = new URL(this.apiUrl + '/title/content_list/?title_id=' + manga.id);
        const req = new Request(uri, this.requestOptions);
        const res = await this.fetchJSON(req, 5);
        let pageBtn = this._querySelectorFromHtmlString(res.data.html_content + res.data.html_page, this.pageNoSelector);

        if (pageBtn.length != 0) {
            pageCount = parseInt(pageBtn[0].text);
        }

        for (let i = 1; i <= pageCount; i++) {
            chapterList = chapterList.concat(await this._getChaptersFromPage(uri, i, manga.id));
        }
        return chapterList;
    }

    async _getChaptersFromPage(uri, page, mangaId) {
        page = page || 1;
        let req = new Request(new URL(uri + '&page=' + page), this.requestOptions);
        let res = await this.fetchJSON(req, 5);
        let chapters = this._querySelectorFromHtmlString(res.data.html_content, '.inner_table');
        return Array.from(chapters)
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
                    id: this.chapLnkTmpl[0] + contentId + this.chapLnkTmpl[1] + u0 + this.chapLnkTmpl[2] + mangaId + this.chapLnkTmpl[3] + contentId,
                    title: title,
                };
            });
    }

    _sanitizeMangaTitle(title) {
        const chapterReleaseStr = '<Chapter release>';
        return title.replace(chapterReleaseStr, '');
    }

    _sanitizeMangaTitleFromNewReleases(title) {
        title = this._sanitizeMangaTitle(title);
        let splitTitle = title.split(' ');
        splitTitle.splice(0, 1);
        return splitTitle.join(' ');
    }

    _querySelectorFromHtmlString(htmlStr, selector) {
        let dom = document.createElement('html');
        dom.innerHTML = htmlStr;
        return dom.querySelectorAll(selector);
    }
}
