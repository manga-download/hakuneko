import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Bx117 extends Connector {

    constructor() {
        super();
        super.id = 'bx117';
        super.label = '117漫画网 (bx117)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'http://m.bx117.com';
    }
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'p.txtItme.h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'a.d-nowrap',3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(new Array(qTcms_page.total).fill().map((_,ind) => new URL(getPicUrlP(qTcms_S_m_murl,ind),qTcms_m_weburl).href));
            });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data;
    }
}