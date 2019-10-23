import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Tsumino extends Connector {

    constructor() {
        super();
        super.id = 'tsumino';
        super.label = 'Tsumino';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://www.tsumino.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head meta[property="og:title"]');
        let id = parseInt(uri.pathname.split('/').pop());
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangaListPage(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(manga => {
            return {
                id: manga.entry.id,
                title: manga.entry.title
            };
        });
    }

    async _getMangaList( callback ) {
        let uri = new URL('/Search/Operate/', this.url);
        uri.searchParams.set('type', 'Book');
        uri.searchParams.set('PageNumber', 0);
        uri.searchParams.set('Text', '');
        uri.searchParams.set('Sort', 'Alphabetical');
        uri.searchParams.set('List', 0);
        uri.searchParams.set('Length', 0);
        uri.searchParams.set('MinimumRating', 0);
        uri.searchParams.set('ExcludeList', 0);
        uri.searchParams.set('CompletelyExcludeHated', false);
        try {
            let mangaList = [];
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);
            let pageCount = data.pageCount;
            for(let page = 1; page <= pageCount; page++) {
                uri.searchParams.set('PageNumber', page);
                let mangas = await this._getMangaListPage(uri);
                mangaList.push(...mangas);
            }
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList( manga, callback ) {
        try {
            let chapterList = [ Object.assign({ language: '' }, manga) ];
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
                    let link = document.querySelector('div.book-line div.book-data a#btnReadOnline');
                    resolve(link.href);
                });
            `;
            let referer = new Request(this.url + '/entry/' + manga.id, this.requestOptions);
            let link = await Engine.Request.fetchUI(referer, script);
            script = `
                new Promise(async (resolve, reject) => {
                    try {
                        let element = document.querySelector('div#image-container');
                        let chapterID = parseInt(element.dataset.opt);
                        let templateURL = element.dataset.cdn ? new URL(decodeURI(element.dataset.cdn), window.location).href : undefined;
                        let baseURI = element.dataset.obj ? new URL(decodeURI(element.dataset.obj), window.location) : undefined;
                        let loaderURI = element.dataset.url ? new URL(decodeURI(element.dataset.url), window.location) : undefined;
                        loaderURI.searchParams.set('q', chapterID);
                        let pageList = [];
                        let response = await fetch(loaderURI);
                        let data = await response.json();
                        for (let index = 0; index < data.reader_page_total; index++) {
                            if(templateURL) {
                                pageList.push(templateURL.replace('[PAGE]', index + 1));
                            } else {
                                baseURI.set('name', data.reader_page_urls[index]);
                                pageList.push(baseURI.href);
                            }
                        }
                        resolve(pageList);
                    } catch(error) {
                        reject(error);
                    }
                }); 
            `;
            let request = new Request(link, this.requestOptions);
            request.headers.set('x-referer', referer.url);
            let pageList = await this._captchaFetchUI(request, script);
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    async _captchaFetchUI(request, script) {
        let captcha = `
            new Promise(resolve => {
                let element = document.querySelector('div.auth-page');
                resolve(!element);
            });
        `;
        let success = await Engine.Request.fetchUI(request, captcha);
        if(success) {
            return Engine.Request.fetchUI(request, script);
        } else {
            return new Promise((resolve, reject) => {
                let win = window.open(request.url);
                win.eval(`
                    [...document.querySelectorAll('nav.tsumino-nav, div.ads-area')].forEach(element => element.parentElement.removeChild(element));
                `);
                let timer = setInterval(() => {
                    if(win.closed) {
                        clearTimeout(timeout);
                        clearInterval(timer);
                        resolve(Engine.Request.fetchUI(request, script));
                    } else {
                        //console.log('OPEN:', win.location.href);
                    }
                }, 750);
                let timeout = setTimeout(() => {
                    clearTimeout(timeout);
                    clearInterval(timer);
                    win.close();
                    reject(new Error('Captcha has not been solved within the given timeout!'));
                }, 120 * 1000);
            });
        }
    }
}