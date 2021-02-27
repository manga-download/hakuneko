import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class JapanRead extends Connector {

    constructor() {
        super();
        super.id = 'japanread';
        super.label = 'Japanread';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.japanread.cc';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.card-header');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const requestOptions = {
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            }
        };
        let request = new Request(new URL('/mangas-list/content', this.url), requestOptions);
        let pages = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-child(2) > a');
        pages = Number(pages[0].text);

        let mangas = [];
        for (let page = 1; page <= pages; page++) {
            request = new Request(new URL('/mangas-list/content?page=' + page, this.url), requestOptions);
            let data = await this.fetchDOM(request, 'a.text-truncate', 5);
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.innerText.trim()
                };
            }));
        }

        return mangas;
    }
    async _getChapters(manga) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const chapters = [...document.querySelectorAll('div.chapter-container div.chapter-row a.text-truncate')].map(element => {
                            return {
                                id: element.pathname,
                                title: element.textContent.trim()
                            };
                        });
                        resolve(chapters);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let id = await this.fetchDOM(request, 'head meta[data-chapter-id]');
        let data = await this.fetchJSON(this.url + '/api/?type=chapter&id=' + id[0].dataset.chapterId);
        return data.page_array.map( page => this.getAbsolutePath( data.baseImagesUrl + '/' + page, request.url ) );
    }
}