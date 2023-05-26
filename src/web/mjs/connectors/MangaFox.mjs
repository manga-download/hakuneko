import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaFox extends Connector {

    constructor() {
        super();
        super.id = 'mangafox';
        super.label = 'MangaFox';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://fanfox.net';
        this.requestOptions.headers.set( 'x-cookie', 'isAdult=1' );
        this.pageLoadDelay = 50;

        // this script uses chapterfun.ashx instead of chapter_bar.js as in MangaHere
        this.scriptSource = 'chapterfun.ashx';

        //ads pictures SHA256 hashes to remove from the pages list
        this.adsHashes = ['7dbfad65d99112b79a3e344b665dbcdea09c5dcfa0e70b6cc057aa4b3565abbb'];
    }

    get script() {
        return `
            new Promise(resolve => {
                if(isbarchpater) {
                    // webtoon (all images on a single page)
                    resolve(newImgs.map(image => new URL(image, window.location.href).href));
                } else {
                    // manga (one image per page)
                    let promises = [...(new Array(imagecount)).keys()].map(p => {
                        return Promise.resolve()
                        .then(() => {
                            return {
                                url: '${this.scriptSource}',
                                data: {
                                    cid: chapterid,
                                    page: p+1,
                                    key: guidkey
                                }
                            };
                        })
                        .then(request => $.ajax(request))
                        .then(script => {
                            eval(script);
                            return Promise.resolve(new URL(d[0], window.location.href).href);
                        });
                    });
                    resolve(Promise.all(promises));
                }
            });
        `;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.detail-info div.detail-info-right p.detail-info-right-title span.detail-info-right-title-font', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/directory/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pager-list div.pager-list-left a:nth-last-child(2)');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`/directory/${page}.htm`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-list-1 ul li p.manga-list-1-item-title a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let data = await this.fetchDOM(uri, 'div#chapterlist ul li a');
        // TODO: license element check ... (e.g. ???)
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('p.title3').innerText.replace(manga.title, '').trim(),
                language: 'english'
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const pages = await Engine.Request.fetchUI(request, this.script);

        const pageList = pages.map(link => this.createConnectorURI({
            url: link,
            referer: this.url
        }));

        const lastImage = await super._handleConnectorURI(pageList.slice(-1));
        // perform advertisement check and may remove last image: pageList.pop()
        const data = CryptoJS.lib.WordArray.create(lastImage.data);

        //hash picture data
        const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);

        //if picture hash is a known ad hash, remove picture
        if (this.adsHashes.includes(hash)) {
            pageList.pop();
        }

        return pageList;
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}
