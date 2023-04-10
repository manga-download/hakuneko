import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class bentomanga extends Connector {

    constructor() {
        super();
        super.id = 'bentomanga';
        super.label = 'Bentô Manga';
        this.tags = [ 'manga', 'webtoon', 'novel', 'french' ];
        this.url = 'https://bentomanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.component-manga-title_main h1'); 
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim(); 
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/manga_list', this.requestOptions); 
        let data = await this.fetchDOM(request, 'div.div-manga_cover a'); 
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }    
    async _getListPage(path, page) {
        let paginatorNumber = page - 1; // page count starts with 0.
        let request = new Request(this.url + path + '?limit=' + paginatorNumber + '&cb=1681162683562', this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest'); // set nessecary header to get json api response.
        const data = await this.fetchJSON(request);
        return data;
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.component-chapter-title > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.chapter_volume').innerText.trim() + ' ' + element.querySelector('span.chapter_title').innerText.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve, reject) => {
                if(document.querySelector('form#captcha-form')) {
                    return reject(new Error('The chapter is protected by reCaptcha! Use the manual website interaction to solve the Captcha for an arbitrary chapter before downloading any other chapter from this website.'));
                }
                const info = document.querySelector('head meta[data-chapter-id]');
                const uri = new URL('/api/?type=chapter&id=' + info.dataset.chapterId, window.location.origin);
                const customHeaders = {
                    headers: {'X-Requested-With' : 'XMLHttpRequest'}
                };
                const response = await fetch(uri.href,customHeaders);
                const data = await response.json();
                debugger
                const images = data.page_array.map(page => new URL(data.baseImagesUrl + '/' + page, uri.href).href);
                resolve(images);
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(image => this.createConnectorURI({
            url: image,
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}