import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CyComi extends Connector {

    constructor() {
        super();
        super.id = 'cycomi';
        super.label = 'CyComi';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://cycomi.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, 'div.title-texts > h3'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 0; page < 8; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/fw/cycomibrowser/title/serialization/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.card-content > a.card');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.card-texts-title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.title-chapters > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.chapter-title').textContent.trim(),
                language: '',
            };
        }).reverse();
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const pages = await this.fetchDOM(request, 'div.swiper-slide > source');
        return pages.filter(page => !page.src.includes('data:image')).map(x => x.src);
    }
}