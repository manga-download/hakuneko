import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Penlab extends Connector {

    constructor() {
        super();
        super.id = 'penlab';
        super.label = 'Penlab';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'http://penlab.ink';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section div.container div.row h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL('/titles/', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section div.container div.row a.title-tile-a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.pathname.split('/')[2].replace(/-/g, ' ').toUpperCase()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section div.container div.row a.release-tile-a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.release-tile__canonical-name span').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.comic-reel source');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}