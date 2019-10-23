import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaMx extends Connector {

    constructor() {
        super();
        super.id = 'mangamx';
        super.label = 'MangaMx';
        this.tags = [ 'maga', 'spanish' ];
        this.url = 'https://manga-mx.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname;
        let title = data[0].content.split(' — ')[0].trim();
        return new Manga(this, id, title);
    }

    async _getMangaList(callback) {
        try {
            const path = '/directorio/';
            let request = new Request(this.url + path, this.requestOptions);
            let data = await this.fetchDOM(request, 'div#content nav#paginacion a:last-of-type');
            let pageCount = parseInt(data[0].href.match(/p=(\d+)$/)[1]);
            let mangaList = [];
            for(let page of new Array(pageCount).keys()) {
                //await this.wait(this.config.throttle.value);
                let request = new Request(this.url + path + '?p=' + (page + 1), this.requestOptions);
                let data = await this.fetchDOM(request, 'div#content article#item a h2');
                let mangas = data.map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                        title: element.textContent.trim()
                    };
                });
                mangaList = mangaList.concat(mangas);
            }
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    _createChapterRequest(manga) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = 'cap_list=';
        let request = new Request(this.url + manga.id, this.requestOptions);
        request.headers.set('content-type', 'application/x-www-form-urlencoded');
        this.requestOptions.method = 'GET';
        delete this.requestOptions.body;
        return request;
    }

    async _getChapterList(manga, callback) {
        try {
            let request = this._createChapterRequest(manga);
            let data = await this.fetchJSON(request);
            let baseURL = data.shift();
            let chapterList = data.map(item => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(item.id, new URL(baseURL, request.url)),
                    title: item.tc + item.titulo,
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let script = `
                new Promise(resolve => {
                    let images = cap_info[1];
                    let baseURL = images.shift();
                    images = images.map(image => new URL(baseURL + image, window.location.href).href);
                    resolve(images);
                });
            `;
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await Engine.Request.fetchUI(request, script);
            callback(null, data);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}