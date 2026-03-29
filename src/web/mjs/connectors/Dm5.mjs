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
        this.queryChapters = 'div#chapterlistload ul[id^="detail-list-select-"] li a';
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
                title: (element.text || element.title ).replace(/（[0-9]+P）/gim, '').replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        return this._getPagesMobile(chapter);
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
        return data.filter((item, index) => data.indexOf(item) === index).map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        data[0].querySelectorAll('span').forEach((elem) => elem.remove());
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
}
