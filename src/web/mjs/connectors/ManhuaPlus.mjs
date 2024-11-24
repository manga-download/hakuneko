import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhuaPlus extends Connector {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaplus.org';
        this.path = '/all-manga/';

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'header h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.blog-pager span:last-of-type a');
        const pageCount = parseInt(data[0].href.match(/\/(\d)+\//)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.grid div.text-center > a');
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
        const data = await this.fetchDOM(request, 'li.chapter > a');
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
