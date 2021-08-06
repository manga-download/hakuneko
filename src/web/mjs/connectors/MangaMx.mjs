import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaMx extends Connector {

    constructor() {
        super();
        super.id = 'mangamx';
        super.label = 'MangaMx';
        this.tags = ['manga', 'spanish'];
        this.url = 'https://manga-mx.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname;
        let title = data[0].content.split(' — ')[0].trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const path = '/directorio?adulto=false&orden=asc';
        let request = new Request(this.url + path, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content ul.pagination a:last-of-type');
        let pageCount = parseInt(data[data.length - 2].href.match(/p=(\d+)$/)[1]);
        let mangaList = [];
        const uri = new URL(path, this.url);
        for (let page of new Array(pageCount).keys()) {
            //await this.wait(this.config.throttle.value);
            uri.searchParams.set('p', page + 1);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'div#content div#content-left div#article-div a');
            let mangas = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                    title: element.querySelector('span').textContent.trim()
                };
            });
            mangaList = mangaList.concat(mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let data = await this.fetchDOM(uri, 'div#entry-manga div#c_list a');
        return data.map(element => {
            let id = this.getRootRelativeOrAbsoluteLink(element, this.url);
            if (id.endsWith('cascada/')) id = id.slice(0, -8);
            return {
                id: id,
                title: element.querySelector('div.entry-title h3.entry-title-h2').innerText.trim(),
                language: 'es'
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const imagelist = hojas;
                        resolve(imagelist.map(img => dir + img));
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id + 'cascada/', this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}