import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Sadscans extends Connector {

    constructor() {
        super();
        super.id = 'sadscans';
        super.label = 'Sadscans';
        this.tags = [ 'manga', 'turkish', 'scanlation' ];
        this.url = 'https://sadscans.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = await this.fetchDOM(request, 'div.title h2')[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/series', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.series-list');
        return data.map(item => {
            return {
                id: item.querySelector('a').pathname,
                title: item.querySelector('h2').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chap-link div.link a');
        return data.map(item => {
            return {
                id: item.pathname,
                title: item.textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.swiper-slide source');
        return data.map(x => x.src);
    }
}