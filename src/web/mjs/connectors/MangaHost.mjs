import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHost extends Connector {

    constructor() {
        super();
        super.id = 'mangahost';
        super.label = 'MangaHost';
        this.tags = ['manga', 'portuguese'];
        this.url = 'https://mangahostz.com';
    }

    canHandleURI(uri) {
        return /https?:\/\/(mangahost(ed|z|2|4)\.com|mangahost\.(net|site))/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.title');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    _getMangaListFromPages(mangaPageLinks, index) {
        if (index === undefined) {
            index = 0;
        }
        return this.wait(0)
            .then(() => this.fetchDOM(mangaPageLinks[index], 'a.manga-block-title-link', 5))
            .then(data => {
                let mangaList = data.map(element => {
                    return {
                        id: this.getRelativeLink(element),
                        title: element.text.trim()
                    };
                });
                if (index < mangaPageLinks.length - 1) {
                    return this._getMangaListFromPages(mangaPageLinks, index + 1)
                        .then(mangas => mangas.concat(mangaList));
                } else {
                    return Promise.resolve(mangaList);
                }
            });
    }

    _getMangaList(callback) {
        this.fetchDOM(this.url + '/mangas', 'div.paginador div.wp-pagenavi a.last')
            .then(data => {
                let pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
                let pageLinks = [... new Array(pageCount).keys()].map(page => this.url + '/mangas/page/' + (page + 1));
                return this._getMangaListFromPages(pageLinks);
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                console.error(error, this);
                callback(error, undefined);
            });
    }

    _getChapterList(manga, callback) {
        const url = new URL(manga.id, this.url);
        url.searchParams.set('t', Date.now());
        this.fetchDOM(url.href, 'div.chapters div.card.pop div.pop-title span')
            .then(data => {
                let chapterList = data.map(element => {
                    return {
                        id: [manga.id, element.textContent].join('/'),
                        title: element.textContent,
                        language: 'pt'
                    };
                });
                callback(null, chapterList);
            })
            .catch(error => {
                console.error(error, manga);
                callback(error, undefined);
            });
    }

    _getPageList(manga, chapter, callback) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        this.fetchRegex(request, /<img\s+id='img_\d+'\s+src='(.*?)'/g)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }
}
