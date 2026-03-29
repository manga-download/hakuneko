import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Asgard1team extends Connector {

    constructor() {
        super();
        super.id = 'asgard1team';
        super.label = 'Asgard1team';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://www.asgard1team.com';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url+'/manga-list/?page='+page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.anime-list-content div.manga-card');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.manga-card__title'), request.url),
                title: element.querySelector('source.img-responsive').getAttribute('alt').trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.col-md-9 div.author-info-title > h6');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'tbody > tr');
        return data.map(element => {
            let num = element.querySelector('td[scope="row"]').textContent.trim();
            let re = new RegExp(manga.title, 'i');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url),
                title: `${num} ${element.querySelector('a').text.replace(re, '').replace(num, '').trim()}`
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container source');
        return data.map(element => this.getAbsolutePath(element, this.url));
    }
}