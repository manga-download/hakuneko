import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangaz extends Connector {

    constructor() {
        super();
        super.id = 'mangaz';
        super.label = 'Manga Library Z (マンガ図書館Z)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.mangaz.com';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL('/title/addpage_renewal?query=&page='+page, this.url), {
            method:'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await this.fetchDOM(request, 'h4 > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'li.title');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve,reject) => {
                let g = JCOMI.namespace("JCOMI.document")
                let b = g.getDoc()
                let img = g.getImages().map(ele => g.getLocationDir('enc') + ele.file + "?vw=" + encodeURIComponent(JCOMI.namespace("JCOMI.config").getVersion()))
                resolve({img:img,b:b});
            });
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.img.map(ele => this.createConnectorURI({
            url:this.getAbsolutePath(ele, request.url),
            key:data.b.Enc.key,
            iv:data.b.Enc.iv
        }));
    }

    async _handleConnectorURI(payload) {
        const response = await fetch(payload.url);
        const encrypted = CryptoJS.lib.WordArray.create(await response.arrayBuffer());
        const iv = CryptoJS.enc.Base64.parse(btoa(payload.iv));
        const key = CryptoJS.enc.Utf8.parse(payload.key);
        let decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, { iv: iv });
        decrypted = decrypted.toString(CryptoJS.enc.Utf8);
        decrypted = Uint8Array.from(atob(decrypted), char => char.charCodeAt(0));
        decrypted = {
            mimeType: response.headers.get('content-type'),
            data: decrypted
        };
        this._applyRealMime(decrypted);
        return decrypted;
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'body');
        return data[0].querySelector("li.item") ? [...data[0].querySelectorAll("li.item")].map(ele => {
            return{
                id:ele.querySelector('button').dataset['url'].replace('navi', 'virgo/view'),
                title:ele.querySelector('span').textContent.trim()
            };
        }): [{
            id:data[0].querySelector('button').dataset['url'].replace('navi', 'virgo/view'),
            title:manga.title
        }];
    }
}
