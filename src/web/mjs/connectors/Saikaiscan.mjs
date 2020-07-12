import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SaikaiScan extends Connector {

    constructor() {
        super();
        super.id = 'saikaiscan';
        super.label = 'Saikaiscan';
        this.tags = [ 'manga', 'portuguese', 'webtoon' ];
        this.url = 'https://saikaiscan.com.br';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#project-content h2');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#menu > ul > li:nth-child(4) div.submenu ul li a:not(.arrow)');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapters ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.images-block source.lazyload');
        return data.map(element => this.getAbsolutePath(element, this.url));
    }
}