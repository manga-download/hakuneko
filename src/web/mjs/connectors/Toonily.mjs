import WordPressMadara from './templates/WordPressMadara.mjs';
import Manga from '../engine/Manga.mjs';

export default class Toonily extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonily';
        super.label = 'Toonily';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://toonily.com';

        this.queryTitleForURI = 'div.site-content div.post-title';
        this.requestOptions.headers.set('x-cookie', 'toonily-mature=1');
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryTitleForURI);
        const element = [...data].pop();
        [...element.querySelectorAll('span.manga-title-badges')].forEach(bloat => {
            if (bloat.parentElement) {
                bloat.parentElement.removeChild(bloat);
            }
        });
        const title = (element.content || element.textContent).trim();
        return new Manga(this, uri, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.wp-pagenavi > a.last');
        let pageCount = parseInt(data[0].href.match(/(\d+)\/?$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
}
