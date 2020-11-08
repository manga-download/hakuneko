import Connector from '../engine/Connector.mjs';
//import Manga from '../engine/Manga.mjs';

export default class Mangaz extends Connector {

    constructor() {
        super();
        super.id = 'mangaz';
        super.label = 'mangaz';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.mangaz.com';
    }

    // async _getMangas() {
    //     let mangaList = [];
    //     const request = new Request(new URL('/manga/official/search', this.url), this.requestOptions);
    //     const data = await this.fetchDOM(request, 'span:last-child > a');
    //     const pageCount = parseInt(data[0].href.match(/(\d)+$/)[1]);
    //     for(let page = 1; page <= pageCount; page++) {
    //         let mangas = await this._getMangasFromPage(page);
    //         mangaList.push(...mangas);
    //     }
    //     return mangaList;
    // }

    // async _getMangasFromPage(page) {
    //     const request = new Request(new URL(`/manga/official/search?page=${page}`, this.url), this.requestOptions);
    //     const data = await this.fetchDOM(request, 'div.official-manga-panel > a');
    //     return data.map(element => {
    //         return {
    //             id: this.getRootRelativeOrAbsoluteLink(element, this.url),
    //             title: element.querySelector('.title').textContent.replace('[R18]', '').trim()
    //         };
    //     });
    // }

    // async _getMangaFromURI(uri) {
    //     const request = new Request(uri, this.requestOptions);
    //     const data = await this.fetchDOM(request, 'div.manga-detail-description > div.title');
    //     const id = uri.pathname + uri.search;
    //     const title = data[0].textContent.trim();
    //     return new Manga(this, id, title);
    // }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve,reject) => {
                let g = JCOMI.namespace("JCOMI.document")
                let H = JCOMI.namespace("JCOMI.config")
                let b = g.getDoc()
                let img = g.getImages().map(ele => g.getLocationDir('enc') + ele.file + "?vw=" + encodeURIComponent(H.getVersion()))
                let list = await img.map(async (ele) => {
                    try{
                        let res = await fetch(ele)
                        let data = await res.arrayBuffer();
                        let a = forge.aes.startDecrypting(b.Enc.key, b.Enc.iv);
                        await a.update(forge.util.createBuffer(data));
                        return a.output.toString();
                    }catch(error){
                        reject(error)
                    }
                });
                resolve(list)
            });
        `;
        const request = new Request(new URL(chapter.id.replace('navi','virgo/view'), this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'body');
        return [{
            id:data[0].querySelector('p.readBtnLarg > button').dataset['url'],
            title:data[0].querySelector('div.bookHeadDetail > h1').textContent.trim()
            },
            ...[...data[0].querySelectorAll('div:nth-child(4) div.listBox')].map(ele => {
            return{
                id:ele.querySelector('button').dataset['url'],
                title:ele.querySelector('h4').textContent.trim()
            }
        })]
    }
}