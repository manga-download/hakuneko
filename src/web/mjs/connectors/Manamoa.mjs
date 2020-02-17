import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Manamoa extends Connector {

    constructor() {
        super();
        super.id = 'manamoa';
        super.label = '마나모아 (MANAMOA)';
        this.tags = [ 'manga', 'korean' ];
        this.url = 'https://manamoa.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.information div.manga-subject div.title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/bbs/page.php?hid=manga_list', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a.page-link');
        let pageCount = parseInt(data[0].href.match(/\d+/)[0]);
        for(let page = 0; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/bbs/page.php?hid=manga_list&page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-list-gallery div.post-list div.manga-subject a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-list div.slot');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), request.url),
                title: element.querySelector('div.title').firstChild.textContent.replace(/\s+/g, ' ').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /img_list\s*=\s*(\[.+\])\s*;/g);
        return JSON.parse(data[0]).map(image => this.getAbsolutePath(image, request.url));
    }
}