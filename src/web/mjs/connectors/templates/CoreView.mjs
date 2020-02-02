import Connector from '../../engine/Connector.mjs';

export default class CoreView extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.path = [ '/series', '/series/oneshot', '/series/finished' ];
        this.queryManga = 'article.series-list-wrapper ul.series-list > li.series-list-item > a';
        this.queryMangaTitle = 'h2.series-list-title';

        this.queryChaptersReadableList = 'div.js-readable-product-list';
        this.queryChaptersLatestContainer = 'div.js-latest-readable-product-list';
        this.queryChaptersFirstContainer = 'div.js-first-readable-product-list';
        this.queryChaptersMoreContainer = 'section.read-more-container';
        this.queryChaptersMoreButton = 'button[data-read-more-endpoint]';

        this.queryChapters = 'ul.series-episode-list > li.episode:not(.private) h4.series-episode-list-title';
        this.queryChaptersSkip = '_';
        this.queryChapterTitle = 'a.series-episode-list-container';

        this.queryPages = 'source.page-image[data-src]';
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
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector(this.queryMangaTitle).textContent.trim()
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
        let data = await this.fetchDOM(request, this.queryChaptersReadableList)

        let promises = [];

        let readList = data[0];
        if(readList && readList.dataset['latestListEndpoint'] && readList.querySelector(this.queryChaptersLatestContainer)) {
            let promise = this._insertEndpoint(readList.dataset.latestListEndpoint, readList.querySelector(this.queryChaptersLatestContainer));
            promises.push(promise);
        }
        if(readList && readList.dataset['firstListEndpoint'] && readList.querySelector('.js-first-readable-product-list')) {
            let promise = this._insertEndpoint(readList.dataset.firstListEndpoint, readList.querySelector(this.queryChaptersFirstContainer));
            promises.push(promise);
        }

        let readMore = readList.querySelector(this.queryChaptersMoreContainer + ' ' + this.queryChaptersMoreButton);
        if(readMore && readMore.dataset['readMoreEndpoint']) {
            let promise = this._insertEndpoint(readMore.dataset.readMoreEndpoint, readList.querySelector(this.queryChaptersMoreContainer));
            promises.push(promise);
        }

        await Promise.all(promises);
        return [...readList.querySelectorAll(this.queryChapters)]
            .filter(element => !element.parentElement.querySelector(this.queryChaptersSkip))
            .map(element => {
                let parent = element.closest(this.queryChapterTitle);
                return {
                    id: parent ? this.getRelativeLink(parent) : manga.id,
                    title: element.textContent.replace(manga.title, '').trim() || manga.title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id + '.json', this.url), this.requestOptions);
        let data = await this.fetchJSON(request);
        if(!data.readableProduct.isPublic && !data.readableProduct.hasPurchased) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        return data.readableProduct.pageStructure.pages.filter(page => page.type === 'main').map(page => {
            if(['usagi', 'baku'].some(encryption => data.readableProduct.pageStructure.choJuGiga === encryption)) {
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