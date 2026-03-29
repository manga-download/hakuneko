import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicKiba extends Connector {

    constructor() {
        super();
        super.id = 'comickiba';
        super.label = 'ManhuaGold';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manhuagold.top';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const [ data ] = await this.fetchDOM(request, 'article header h1');
        return new Manga(this, uri.pathname, data.textContent.trim());
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/all-manga/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.grid div.text-center a.clamp');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul#myUL li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
            
                function parseResults(data) {
                    const dom = new DOMParser().parseFromString(data, 'text/html');
                    let nodes = [...dom.querySelectorAll('div.separator')];
                    if (nodes.length == 0) reject();
            
                    //sort if needed
                    if (nodes[0].hasAttribute('data-index')) {
                        nodes = nodes.sort(function (a, b) {
                            const za = parseInt(a.dataset.index);
                            const zb = parseInt(b.dataset.index);
                            return za - zb;
                        });
                    }
                    resolve(nodes.map(element => {
                        const anchorElement = element.querySelector('a.readImg');
                        return anchorElement.href ;
                    }));
                }
            
                const ajaxendpoint = new URL('/ajax/image/list/chap/'+ CHAPTER_ID, window.location.href);
                fetch(ajaxendpoint, {
                    headers: {
                        'X-Requested-With' : 'XMLHttpRequest',
                    }})
                    .then(response => response.json())
                    .then(jsonData => {
                          parseResults(jsonData.html);
                    });
            });
        `;

        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}
