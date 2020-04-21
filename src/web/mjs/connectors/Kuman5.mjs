import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kuman5 extends Connector {
    constructor() {
        super();
        super.id = 'kuman5';
        super.label = '酷漫屋 (Kuman5)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'http://www.kuman5.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.banner_detail div.info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/sort/1-${page}.html`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.mh-list li div.mh-item-detali h2.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(`/mulu${manga.id}1-1.html`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#chapterlistload ul#detail-list-select-1 li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.childNodes[0].nodeValue.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /km5_img_url\s*=\s*['"]([^'"]+)['"]/g);
        return JSON.parse(atob(data[0])).map(page => page.split('|')[1]);
    }
}