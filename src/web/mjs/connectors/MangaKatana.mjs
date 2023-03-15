import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaKatana extends Connector {

    constructor() {
        super();
        super.id = 'mangakatana';
        super.label = 'MangaKatana';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangakatana.com';
        this.queryPages = '#imgs .wrap_img img[data-src]';
        this.config = {
            throttle: {
                label: 'Manga list Throttle [ms]',
                description: 'Enter the timespan in [ms] to delay consecutive requests to the website for Manga list fetching',
                input: 'numeric',
                min: 100,
                max: 10000,
                value: 1000
            }
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#book_list ul.uk-pagination li:nth-last-of-type(2) a');
        let pageCount = parseInt(data[0].href.match(/\/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            await this.wait(this.config.throttle.value);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga/page/' + page + '?filter=1', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#book_list div.item div.text h3.title a');
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
        const data = await this.fetchDOM(request, 'div.chapters table tbody tr td div.chapter a');
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
                setTimeout(() => {
                    try {
                        resolve([ ...document.querySelectorAll('${this.queryPages}') ].map(element => element.dataset.src));
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.createConnectorURI(link));
    }
}
