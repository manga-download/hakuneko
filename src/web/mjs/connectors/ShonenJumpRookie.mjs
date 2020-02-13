import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ShonenJumpRookie extends Connector {

    constructor() {
        super();
        super.id = 'shonenjumprookie';
        super.label = 'ジャンプルーキー (Jump Rookie)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://rookie.shonenjump.com';
    }

    // Fetch API does not provide access to custom headers => use XmlHTTPRequest instead
    async _fetchWithHeaders(request) {
        return new Promise((resolve, reject) => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if(this.status == 200) {
                        let headers = new Headers();
                        let next = xhttp.getResponseHeader('Tky-Link-Rel-Next');
                        if(next) {
                            headers.set('tky-link-rel-next', next);
                        }
                        resolve({
                            headers: headers,
                            text: async () => xhttp.responseText
                        });
                    } else {
                        reject(new Error('Connection failed with status: ' + this.status == 200));
                    }
                }
            };
            xhttp.open('GET', request.url, true);
            xhttp.send();
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.series-title-container h1.series-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'section#popular-series');

        let mangaList = [...data[0].querySelectorAll('ol.series-box-list li section.series-contents a')].map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('h1.series-title').textContent.trim()
            };
        });
        let mangas = await this._getMangasFromPage(data[0].querySelector('ol[data-series-read-more-url]').dataset.seriesReadMoreUrl);
        mangaList.push(...mangas);
        return mangaList;
    }

    async _getMangasFromPage(url) {
        let request = new Request(new URL(url, this.url), { mode: 'cors' });
        let response = await this._fetchWithHeaders(request);
        let data = await response.text();
        let mangas = [...this.createDOM(data).querySelectorAll('li section.series-contents a')].map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('h1.series-title').textContent.trim()
            };
        });
        let next = response.headers.get('tky-link-rel-next');
        if(next) {
            return mangas.concat(await this._getMangasFromPage(next));
        } else {
            return mangas;
        }
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#episode-list li a.episode-content');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.episode-title').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.image-container p.page-area source.js-page-image');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}