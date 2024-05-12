import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TruyenQQ extends Connector {
    constructor() {
        super();
        super.id = 'truyenqq';
        super.label = 'TruyenQQ';
        this.tags = ['manga', 'webtoon', 'vietnamese'];
        this.url = 'https://truyenqqviet.com';
        this.requestOptions.headers.set('x-referer', this.url);
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests when fetching manga list',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1250
            }
        };
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = await this.fetchDOM(request, 'h1[itemprop="name"]');
        return new Manga(this, id, title[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/truyen-moi-cap-nhat/trang-1.html', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page_redirect a:last-child');
        const pageCount = parseInt(data[0].href.match(/-(\d+).html/)[1]);
        for (let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            await this.wait(this.config.throttle.value);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/truyen-moi-cap-nhat/trang-${page}.html`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.list_grid li h3 a');
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(
            request,
            'div.works-chapter-item div.name-chap a'
        );
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-chapter source.lazy');
        return data.map((element) => {
            return this.createConnectorURI({
                url: this.getAbsolutePath(element.dataset['original'], request.url),
            });
        });
    }
    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
