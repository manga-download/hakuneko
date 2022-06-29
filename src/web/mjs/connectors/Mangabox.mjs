import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangabox extends Connector {

    constructor() {
        super();
        super.id = 'mangabox';
        super.label = 'Mangabox';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.mangabox.me';
        this.requestOptions.headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = await this.fetchDOM(request, 'h1.episodes_title');
        return new Manga(this, id, title[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        let nextLink = this.url + '/api/reader/episodes';
        for (let run = true; run;) {
            const data = await this._getMangasFromPage(nextLink);
            nextLink = data.nextLink;
            mangaList.push(...data.mangas);
            if(!nextLink) {
                run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(nextLink) {
        const uri = new URL(nextLink);
        const request = new Request(uri, this.requestOptions);
        const res = await fetch(request);
        const data = await res.json();
        const links = this._parseLinkHeader(res.headers.get('Link') || '');
        var result = {
            mangas: data.map(item => {
                return {
                    id: item.manga.id,
                    title: item.manga.title,
                };
            })
        };
        links.forEach(link => {
            if(link.rel !== 'next') return;
            result.nextLink = link.url;
        });
        return result;
    }

    async _getChapters(manga) {
        const uri = new URL(`/reader/${manga.id}/episodes/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.episodes_list li.episodes_item a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.episodes_strong_text').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.slides li source');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }

    _parseLinkHeader(value) {
        var values = value.split(/\s*,\s*/);
        return values.map(val => val.split(/\s*;\s*/).reduce((result, v) => {
            var keyAndValue;
            if (v[0] === '<' && v[v.length - 1] === '>') {
                if (!result.url) {
                    result.url = v.slice(1, -1);
                }
            } else {
                keyAndValue = v.split('=');
                if (keyAndValue[1] && !result[keyAndValue[0]]) {
                    result[keyAndValue[0]] = keyAndValue[1].slice(1, -1);
                }
            }
            return result;
        }, {}));
    }
}