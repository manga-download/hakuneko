import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class UzayManga extends Connector {

    constructor() {
        super();
        super.id = 'uzaymanga';
        super.label = 'Uzay Manga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://uzaymanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content-details h1');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.overflow-hidden.grid.grid-cols-1 > div > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list-episode a');
        return data.map(chapter => {
            return {
                id: chapter.pathname,
                title : chapter.querySelector('.chapternum').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => {
                __next_f.forEach(element => {
                const el = element[1];
                if (el) {
                  if(el.includes('[{"path":'))  {
                    resolve(el)
                   }
                }
             });
            });
    	  `;

        const uri = new URL( chapter.id, this.url );
        const request = new Request( uri.href, this.requestOptions );
        const data = await Engine.Request.fetchUI(request, script);
        const jsonString = data.match(/(\[{"path":.*}\])}}/)[1];
        const imagesData = JSON.parse(jsonString);
        return imagesData.map(image => 'https://cdn1.uzaymanga.com/series/image/'+ image.path);
    }
}
