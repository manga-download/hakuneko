import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Komiku extends Connector {

    constructor() {
        super();
        super.id = 'komiku';
        super.label = 'Komiku';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komiku.id';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'article header#Judul h1[itemprop="name"]');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'nav ul li[itemprop="name"], div.perapih div.ls2, section#Terbaru div.ls4w div.ls4');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a[href*="/manga/"]'), this.url),
                title: element.querySelector('a span, div.ls2j h4 a, div.ls4j h4 a').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table#Daftar_Chapter td.judulseries a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section#Baca_Komik source');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, this.url));
    }
}