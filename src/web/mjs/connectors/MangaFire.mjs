import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaFire extends Connector {

    constructor() {
        super();
        super.id = 'mangafire';
        super.label = 'MangaFire';
        this.tags = [ 'manga', 'english', 'french', 'japanese', 'portuguese', 'spanish' ];
        this.url = 'https://mangafire.to';
        this.path = '/az-list?page=';

        this.queryMangaTitleFromURI = 'main div.top div.info div.name';
        this.queryMangas = 'div.container div.mangas div.item div.name a';
        this.idRegex = /manga\/.*\.(\w+)/;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname.match(this.idRegex)[1];
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: element.pathname.match(this.idRegex)[1],
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const types = ['chapter', 'volume'];
        for (const type of types) {
            const uri = new URL(`ajax/read/${manga.id}/list?viewby=${type}`, this.url);
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchJSON(request);
            if (!data.result.link_format.includes(`LANG/${type}-NUMBER`)) {
                continue;
            }

            const listsByLanguage = this.createDOM(data.result.html).querySelectorAll('div.numberlist-wrap ul.numberlist');
            for (const list of listsByLanguage) {
                const lang = list.dataset.lang.toUpperCase();
                const chapters = [ ...list.querySelectorAll('li a') ]
                    .map(chapter => {
                        return {
                            id: `${type}/${chapter.dataset.id}`,
                            title: chapter.text.trim().replace(':', '') + ` (${lang})`,
                            language: lang
                        };
                    });
                chapterList.push(...chapters);
            }
        }
        return chapterList;
    }

    async _getPages(chapter) {
        const uri = new URL(`ajax/read/${chapter.id}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.result.images.map(imageArray => {
            if (imageArray[2] < 1) {
                return imageArray[0];
            }
            return this.createConnectorURI(imageArray);
        });
    }

    async _handleConnectorURI(payload) {
        const type = Engine.Settings.recompressionFormat.value;
        const quality = parseFloat(Engine.Settings.recompressionQuality.value) / 100;
        let canvas = await this.reverseImage(payload);
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, type, quality);
        });
        let data = await this._blobToBuffer(blob);
        this._applyRealMime(data);
        return data;

    }

    /******************/
    /* Begin MangaFire*/
    /******************/

    async _loadImage(url) {
        return new Promise((resolve, reject) => {
            const uri = new URL(url);
            let image = new Image();
            image.onload = () => resolve(image);
            image.onerror = error => reject(error);
            image.src = uri.href;
        });
    }

    async reverseImage(imageArray) {
        const e = imageArray[2];
        const canvas = document.createElement('CANVAS');
        const ctx = canvas.getContext('2d');
        const image = await this._loadImage(imageArray[0]);
        image.crossOrigin = 'Anonymous';

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, image.width, image.height);

        const f = 5,
            s = Math.min(200, Math.ceil(image.width / f)),
            h = Math.min(200, Math.ceil(image.height / f)),
            W = Math.ceil(image.width / s) - 1,
            d = Math.ceil(image.height / h) - 1;
        let x, l;
        for (let y = 0; y <= d; y++) {
            for (let m = 0; m <= W; m++) {
                x = m;
                l = y;
                if (m < W) {
                    x = (W - m + e) % W;
                }
                if (y < d) {
                    l = (d - y + e) % d;
                }

                ctx.drawImage(
                    image,
                    x * s,
                    l * h,
                    Math.min(s, image.width - m * s),
                    Math.min(h, image.height - y * h),
                    m * s,
                    y * h,
                    Math.min(s, image.width - m * s),
                    Math.min(h, image.height - y * h)
                );
            }
        }
        return canvas;
    }

    /*****************/
    /* END  MangaFire*/
    /*****************/

}
