import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MagKan extends Connector {

    constructor() {
        super();
        super.id = 'magkan';
        super.label = 'MagKan';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'http://kansai.mag-garden.co.jp';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#main div.panel div.box div.inner');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url),
                title: element.querySelector('h2.comic_name').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const body = await this.fetchDOM(request);
        const current = [...body.querySelectorAll('div#main div.update_summary div.exp ul.btn li a[href*="/assets/files/"]')].map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace(/\/HTML5\/?$/i, ''),
                title: element.text.replace('を読む', '').trim()
            };
        });
        const previous = [...body.querySelectorAll('div#main div.sam_exp div.exp')].map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('ul.btn li a[href*="/assets/files/"]'), this.url).replace(/\/HTML5\/?$/i, ''),
                title: element.querySelector('div.back_number_summary div.ttl').textContent.trim()
            };
        });
        return [ ...current, ...previous ];
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id + '/iPhone/ibook.xml', this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        const data = await response.text();
        const pages = parseInt(data.match(/<total>(\d+)<\/total>/)[1]);
        return new Array(pages).fill().map((_, index) => this.getAbsolutePath(`${chapter.id}/books/images/2/${index + 1}.jpg`, request.url));
    }
}