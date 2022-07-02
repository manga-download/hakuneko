import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ZeurelScan extends Connector {

    constructor() {
        super();
        super.id = 'zeurelscan';
        super.label = 'ZeurelScan';
        this.tags = [ 'manga', 'webtoon', 'italian' ];
        this.url = 'https://zeurelscan.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = await this.fetchDOM(request, '.valore');
        return new Manga(this, id, title[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.titoliSerie');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.rigaCap a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.titolo').textContent.replace(manga.title + ' - ', '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.Immag source');
        return data.map(image => image.src);
    }
}