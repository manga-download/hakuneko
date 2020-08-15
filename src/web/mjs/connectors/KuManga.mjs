import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KuManga extends Connector {

    constructor() {
        super();
        super.id = 'kumanga';
        super.label = 'KuManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://www.kumanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname.match(/^\/manga\/\d+/)[0];
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let script = `
            new Promise(resolve => {
                function btoaReverse(content) {
                    return btoa(content).split('').reverse().join('');
                }
                let fuckedKuMangaAgain = document.querySelector('#searchinput').getAttribute('dt');
                let tokenIdentifier = btoaReverse(fuckedKuMangaAgain).replace(/=/g, 'k');
                let tokenAttribute = btoaReverse(btoaReverse(fuckedKuMangaAgain)).replace(/=/g, 'k').toLowerCase();
                resolve(document.getElementById(tokenIdentifier).getAttribute(tokenAttribute));
            });
        `;
        let mangaList = [];
        let uri = new URL('/mangalist', this.url);
        let request = new Request(uri, this.requestOptions);
        let token = await Engine.Request.fetchUI(request, script);
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(token, page);
            mangas.length > 1 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(token, page) {
        let uri = new URL('/backend/ajax/searchengine.php', this.url);
        let form = new URLSearchParams();
        form.append('token', token);
        form.append('contentType', 'manga');
        form.append('retrieveCategories', false);
        form.append('retrieveAuthors', false);
        form.append('perPage', 75);
        form.append('page', page);
        let request = new Request(uri, {
            method: 'POST',
            body: form.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        let data = await this.fetchJSON(request);
        return data.contents.map(entry => {
            return {
                id: ['/manga', entry.id/*, entry.slug*/].join('/'),
                title: entry.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request( this.url + manga.id + '/p/' + page, this.requestOptions );
        let data = await this.fetchDOM(request, 'table.table tr td h4.title > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace('/c/', '/leer/'),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(pUrl.map(page => page.imgURL));
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        let promises = data.map(async link => {
            let redirector = new URL(link, this.url);
            if(redirector.pathname.endsWith('/img.php')) {
                let controller = new AbortController();
                let response = await fetch(new Request(redirector, { signal: controller.signal, ...this.requestOptions }));
                controller.abort();
                return response.url;
            } else {
                return redirector.href;
            }
        });
        return Promise.all(promises);
    }
}