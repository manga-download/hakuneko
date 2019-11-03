import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ScansMangas extends Connector {

    constructor() {
        super();
        super.id = 'scansmangas';
        super.label = 'ScansMangas';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://scans-mangas.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.breadcrumbs ul li:last-of-type a');
        let id = uri.pathname;
        let title = data[0].text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/mangas/', this.requestOptions);
        let data = await this.fetchDOM(request, 'section.ft-entry div.item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), request.url),
                title: element.querySelector('h2').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content article.manga h2.entry-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('view', '');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.ft-entry div.lol source');
        return data.map(element => this.getAbsolutePath(element.dataset.src, request.url));
    }
}