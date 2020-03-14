import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReadKomik extends Connector {

    constructor() {
        super();
        super.id = 'readkomik';
        super.label = 'ReadKomik';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.readkomik.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'article h1.entry-title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/p/blog-page.html', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content div[dir="ltr"] > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content div.separator source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}