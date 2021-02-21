import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

// Template based on the TruyenChon comic theme for the mojoPortal CMS
export default class MojoPortalComic extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.queryMangaTitle = 'meta[property="og:title"]';
        this.queryChapter = 'div.list-chapter ul li.row div.chapter a';
        this.queryPages = 'div.reading div.page-chapter source';
        this.path = '/?page=';
        this.queryMangasPageCount = 'div.pagination-outter ul.pagination li:last-of-type a';
        this.pathMatch = /(\d+)$/;
        this.queryMangas = 'div.ModuleContent div.items div.item figcaption a.jtip';
    }

    _getImageURL(chapterURL, imageURL) {
        /* Known Image Hosting Domains
            forumnt.com
            imageinstant.com
            boxtruyen.net
            netsnippet.com
            mangasy.com
            googleusercontent.com
            blogspot.com
            mangapark.net
        */
        if(imageURL.includes('mangapark.net')) {
            return imageURL;
        }
        if(imageURL.includes('mangasy.com')) {
            return this.createConnectorURI({ url: imageURL, referer: 'https://www.mangasy.com/' });
        }
        return this.createConnectorURI({ url: imageURL, referer: chapterURL });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname + uri.search;
        let title = (data[0].content || data[0].textContent).replace(new RegExp('-?\\s' + this.label, 'i'), '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0] ? data[0].href.match(this.pathMatch)[1] : 1);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.path + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas, 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapter);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            let url = this.getAbsolutePath(element.dataset.original || element.dataset.src || element, request.url); // element.dataset.cdn
            return this._getImageURL(request.url, url);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        if(!response.ok) {
            response = await fetch(this._getGoogleImageProxyRequest(payload.url));
        }
        if(!response.ok) {
            response = await fetch(this._getWeservImageProxyRequest(payload.url));
        }
        let data = await response.blob();
        return this._blobToBuffer(data);
    }

    _getGoogleImageProxyRequest(url) {
        let uri = new URL('https://images2-focus-opensocial.googleusercontent.com/gadgets/proxy');
        uri.searchParams.set('container', 'focus');
        uri.searchParams.set('url', url);
        return new Request(uri, this.requestOptions);
    }

    _getWeservImageProxyRequest(url) {
        let uri = new URL('https://images.weserv.nl');
        uri.searchParams.set('url', url);
        return new Request(uri, this.requestOptions);
    }
}