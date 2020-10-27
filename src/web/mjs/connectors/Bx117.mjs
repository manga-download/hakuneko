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
                resolve(new Array(qTcms_page.total).fill().map((_,ind) => new URL(getPicUrlP(qTcms_S_m_murl,ind+1),qTcms_m_weburl).href));
            });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getMangas() {
        let mangaList = [];
        for(let i = 1; i <= 2 ; i++) {
            for(let page = 1, run = true; run; page++) {
                let mangas = await this._getMangasFromPage(page,3,i);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(page,retries,serial ) {
        let response = await fetch('http://m.bx117.com/statics/qingtiancms.ashx', {
            method: 'POST',
            body: `page=${page}&action=GetWapList&_id=listbody&pagesize=12&order=1&classid1=0&url=%2Fstatics%2Fqingtiancms.ashx&typelianzai=110${serial }`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        if(response.status >= 500 && retries > 0 ) {
            await this.wait( 2500 );
            return this._getMangasFromPage(page,retries-1,serial);
        }
        if (response.status == 200){
            let data = this.createDOM(await response.text());
            return [...data.querySelectorAll('li')].map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element.querySelector('source'), this.url),
                    title: element.textContent.trim()
                };
            });
        };
        throw new Error( `Failed to receive mangas list from m.bx117, report to github issues if there is not already one` )
    }
}