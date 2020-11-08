import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangaz extends Connector {

    constructor() {
        super();
        super.id = 'mangaz';
        super.label = 'mangaz';
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
        let data = await this.fetchDOM(request, 'h4 > a');
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
                let H = JCOMI.namespace("JCOMI.config")
                let b = g.getDoc()
                let img = g.getImages().map(ele => g.getLocationDir('enc') + ele.file + "?vw=" + encodeURIComponent(H.getVersion()))
                resolve(await Promise.all(img.map(async (ele) => {
                    try{
                        let res = await fetch(ele)
                        let data = await res.arrayBuffer();
                        let a = forge.aes.startDecrypting(b.Enc.key, b.Enc.iv);
                        await a.update(forge.util.createBuffer(data));
                        return 'data:image/jpg;base64,' + a.output.toString();
                    }catch(error){
                        reject(error)
                    }
                })));
            });
        `;
        const request = new Request(new URL(chapter.id.replace('navi', 'virgo/view'), this.url), this.requestOptions);
        return (await Engine.Request.fetchUI(request, script)).map(ele => this.createConnectorURI(ele));
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'body');
        return data[0].querySelector("li.box") ? [...data[0].querySelectorAll("li.box")].map(ele => {
            return{
                id:ele.querySelector('button').dataset['url'],
                title:ele.querySelector('span').textContent.trim()
            };
        }): [{
            id:data[0].querySelector('button').dataset['url'],
            title:manga.title
        }];
    }
}