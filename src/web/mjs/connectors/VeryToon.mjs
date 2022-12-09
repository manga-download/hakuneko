import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class VeryToon extends Connector {
    constructor() {
        super();
        super.id = 'verytoon';
        super.label = 'VeryToon';
        this.tags = [ 'webtoon', 'french', 'manga' ];
        this.url = 'https://www.verytoon.com';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.albumpage__actionbar div.row div.col-md-8.py-4.d-none.d-md-block p.h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }
    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'span#list-episodes a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.listitem-banner__footer__text-with-tag h3').textContent.trim()
            };
        }).reverse();
    }
    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id), this.requestOptions);
        let data = await this.fetchDOM(request, 'source.lazyload');
        return data.map(element => {
            return this.getAbsolutePath(element.dataset.src, request.url);
        });
    }
}