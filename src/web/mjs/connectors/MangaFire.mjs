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

        this.queryMangaTitleFromURI = 'div.info h1[itemprop="name"]';
        this.queryMangas = 'div.info > a';
        this.idRegex = /manga\/[^.]+\.(\w+)/;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const title = data[0].textContent.trim();
        return new Manga(this, uri.pathname, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
            await this.wait(250);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const mangas = [];
        const script = `
        new Promise((resolve, reject) => {
                 setTimeout(() => {
                    try {
                        const nodes = [...document.querySelectorAll('${this.queryMangas}')];
                        const mangas = [];
                        nodes.map(element => {
                            mangas.push({
                                id: element.pathname,
                                title : element.text.trim()
                            });   
                        });

                        resolve(mangas);
                    }
                    catch(error) {
                        reject(error);
                    }
                },
                2500);
 
        });
        `;

        //first try getting mangas normally.
        const uri = new URL(this.path + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        if(/waf-js-run/i.test(data)) {
            request = new Request(uri, this.requestOptions);
            return await Engine.Request.fetchUI(request, script);
        } else {
            const dom = this.createDOM(data);
            const nodes = [...dom.querySelectorAll(this.queryMangas)];
            nodes.map(element => {
                mangas.push({
                    id: element.pathname,
                    title : element.text.trim()
                });
            });

            return mangas;
        }

    }

    async _getChapters(manga) {
        //fetch page to get languages available
        const id = manga.id.match(this.idRegex)[1];
        const mangauri = new URL(manga.id, this.url);
        const request = new Request(mangauri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section.m-list div.dropdown-menu a');
        let listsByLanguage = data.map(element => element.dataset.code.toLowerCase());
        listsByLanguage = [...new Set(listsByLanguage)];

        let chapterList = [];
        const types = ['chapter', 'volume'];
        for (const language of listsByLanguage) { //For each language
            for (const type of types) { //for chapters / volumes
                //https://mangafire.to/ajax/read/XXXXX/volume/en
                const uri = new URL(`ajax/read/${id}/${type}/${language}`, this.url);
                const request = new Request(uri, this.requestOptions);
                const data = await this.fetchJSON(request);
                const dom = this.createDOM(data.result.html);
                const chaptersNodes = [...dom.querySelectorAll('a')];
                chaptersNodes.filter(anchor=> anchor.pathname.includes(`/${type}-`))
                    .forEach(chapter => {
                        const id = {itemid : chapter.dataset.id, itemtype : type};
                        const title = chapter.text.trim();
                        chapterList.push ({
                            id : JSON.stringify(id),
                            title : title,
                            language : language
                        });
                    });
            }
        }
        return chapterList;
    }

    async _getPages(chapter) {
        //https://mangafire.to/ajax/read/volume/11111
        //https://mangafire.to/ajax/read/chapter/123456
        const chapterid = JSON.parse(chapter.id);
        const uri = new URL(`ajax/read/${chapterid.itemtype}/${chapterid.itemid}`, this.url);
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
