import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class CoreView extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (iPod; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.163 Mobile/15E148 Safari/604.1');
        // The URL pathes to parse
        this.path = [ '/series', '/series/oneshot', '/series/finished' ];
        // The query to select *all* required data for *one* manga
        this.queryManga = 'article.series-list-wrapper ul.series-list > li.series-list-item > a';
        // Optional query to pinpoint the URI inside of this.queryManga . Most sites don't need this
        this.queryMangaURI = undefined;
        // The query to retrieve the single manga title from inside of this.queryManga
        this.queryMangaTitle = 'h2.series-list-title';

        this.queryMangaTitleFromURI = 'h1.series-header-title';

        this.queryChaptersAtomFeed = 'head link[type*="atom+xml"]';
        this.queryChapters = 'feed entry';

        this.queryPages = 'source.page-image[data-src]';
        this.queryEpisodeJSON = '#episode-json';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of this.path) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(
                    this.queryMangaURI ? element.querySelector(this.queryMangaURI) : element,
                    request.url),
                title: this.queryMangaTitle ? element.querySelector(this.queryMangaTitle).textContent.trim() : element.textContent.trim()
            };
        });
    }

    async _insertEndpoint(uri, element) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        try {
            let content = data.html;
            content = content.replace(/<img/g, '<source');
            content = content.replace(/<\/img/g, '</source');
            element.innerHTML = content;
        } catch(_) {
            return Promise.resolve();
        }
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChaptersAtomFeed);
        let uri = new URL(data[0].href, this.url);
        uri.searchParams.set('free_only', 0); // 0: include non-free, 1: exclude non-free
        data = await this.fetchDOM(new Request(uri, this.requestOptions), this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('link'), this.url),
                title: element.querySelector('title').textContent.replace(manga.title, '').trim() || manga.title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let dataElement = await this.fetchDOM(request, this.queryEpisodeJSON);
        let data = JSON.parse(dataElement[0].dataset.value);
        if(!data.readableProduct.isPublic && !data.readableProduct.hasPurchased) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return data.readableProduct.pageStructure.pages.filter(page => page.type === 'main').map(page => {
            // NOTE: 'usagi' is not scrambled
            if(data.readableProduct.pageStructure.choJuGiga === 'baku') {
                return this.createConnectorURI(page.src);
            } else {
                return this.getAbsolutePath(page.src, request.url);
            }
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._descrambleImage(data);
        return this._blobToBuffer(data);
    }

    /**
     ***************************
     *** COREVIEW CODE BEGIN ***
     ***************************
     */

    async _descrambleImage(blob) {
        let bitmap = await createImageBitmap(blob);
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');

            let width = canvas.width;
            let height = canvas.height;
            let DIVIDE_NUM = 4;
            let MULTIPLE = 8;
            let cell_width = Math.floor(width / (DIVIDE_NUM * MULTIPLE)) * MULTIPLE;
            let cell_height = Math.floor(height / (DIVIDE_NUM * MULTIPLE)) * MULTIPLE;
            //view.drawImage(0, 0, width, height, 0, 0);
            ctx.drawImage(bitmap, 0, 0, width, height, 0, 0, width, height);
            for (let e = 0; e < DIVIDE_NUM * DIVIDE_NUM; e++) {
                let t = Math.floor(e / DIVIDE_NUM) * cell_height;
                let n = e % DIVIDE_NUM * cell_width;
                let r = Math.floor(e / DIVIDE_NUM);
                let i = e % DIVIDE_NUM * DIVIDE_NUM + r;
                let o = i % DIVIDE_NUM * cell_width;
                let s = Math.floor(i / DIVIDE_NUM) * cell_height;
                //view.drawImage(n, t, cell_width, cell_height, o, s);
                ctx.drawImage(bitmap, n, t, cell_width, cell_height, o, s, cell_width, cell_height);
            }

            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100);
        });
    }

    /**
     *************************
     *** COREVIEW CODE END ***
     *************************
     */
}
