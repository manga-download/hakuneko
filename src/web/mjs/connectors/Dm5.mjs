import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// NOTE: Use Modified version of MangaFox reader
// NOTE: Reference SinMH
export default class Dm5 extends Connector {

    constructor() {
        super();
        super.id = 'dm5';
        super.label = 'DM5 漫画';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.dm5.com';
        this.path = '/manhua-list-p%PAGE%/';
        this.requestOptions.headers.set('x-cookie', 'isAdult=1');

        this.queryMangas = 'div.box-body ul li div.mh-item div.mh-item-detali h2.title a';
        this.queryChapters = 'div#chapterlistload ul#detail-list-select-1 li a';
        this.queryMangaTitle = 'div.banner_detail_form div.info p.title';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        // NOTE: https://regex101.com/r/vD6dIl/3
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/（[0-9]+P）/gim, '').replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        return this._getPagesMobile(chapter);
    }

    async _getPagesDesktop(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let lastPage = 1;
                        lastPage = parseInt([...document.querySelectorAll('div#chapterpager.chapterpager a')].pop().text.trim());
                        let pageList = [];
                        let ajaxResult = null;

                        for(let dmpage = 1, run = true; dmpage <= lastPage && run; dmpage++) {
                                if (ajaxResult != null) {
                                    ajaxResult.abort();
                                    ajaxResult = null;
                                }

                                let mkey = '';
                                let data;
                                if ($("#dm5_key").length > 0) {
                                    mkey = $("#dm5_key").val();
                                }
                                ajaxResult = $.ajax({
                                    url: 'chapterfun.ashx',
                                    async: false,
                                    data: { cid: DM5_CID, page: dmpage, key: mkey, language: 1, gtk: 6, _cid: DM5_CID, _mid: DM5_MID, _dt: DM5_VIEWSIGN_DT, _sign: DM5_VIEWSIGN },
                                    type: 'GET',
                                    error: function (msg) {
                                        reject(msg);
                                    },
                                    success: function (msg) {
                                        data = eval(msg);
                                    }
                                });
                                data.length ? pageList.push(...data) : run = false;
                        }
                        resolve(pageList);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.filter((item, index) => data.indexOf(item) === index).map(element => this.getAbsolutePath(element, request.url));
    }

    async _getPagesMobile(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(newImgs);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        uri.hostname = uri.hostname.replace('www', 'm');
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.filter((item, index) => data.indexOf(item) === index).map(element => this.getAbsolutePath(element, request.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

}