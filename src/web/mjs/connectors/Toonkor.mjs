import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Toonkor extends Connector {

    constructor() {
        super();
        super.id = 'toonkor';
        super.label = 'Toonkor';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://toonkor.loan';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(page + '?fil=제목', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#wt_list .section-item div.section-item-title a#title');
        return data.map( element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of [ '/웹툰/연재', '/웹툰/완결' ]) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#bo_list table.web_list tbody tr td.content__title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.dataset.role, request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#toon_img img')].map(img => img.src));
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}