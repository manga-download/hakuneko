import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class AllHentai extends Connector {

    constructor() {
        super();
        super.id = 'allhentai';
        super.label = 'AllHentai';
        this.tags = ['hentai', 'russian'];
        this.url = 'http://allhentai.ru';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[itemprop="name"]', 3);
        let id = uri.pathname;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangaListFromPages(mangaPageLinks, index) {
        index = index || 0;
        let data = await this.fetchDOM(mangaPageLinks[index], 'table.cTable tr td a:first-of-type', 5);
        let mangaList = data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.childNodes[0].textContent.trim()
            };
        });
        if(index < mangaPageLinks.length - 1) {
            let mangas = await this._getMangaListFromPages(mangaPageLinks, index + 1);
            return mangaList.concat(mangas);
        } else {
            return mangaList;
        }
    }

    async _getMangaList( callback ) {
        try {
            let request = new Request(this.url + '/list', this.requestOptions);
            let data = await this.fetchDOM(request, 'span.pagination:first-of-type a.step');
            let pageCount = parseInt(data.pop().text);
            let pageLinks = [...new Array(pageCount).keys()].map(page => {
                let uri = new URL('list', this.url);
                uri.searchParams.set('offset', 60 * page);
                uri.searchParams.set('max', 60);
                return uri.href;
            });
            let mangaList = await this._getMangaListFromPages(pageLinks);
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'table.cTable tr td a[title]');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.replace(manga.title, '').trim(),
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let script = `new Promise(resolve => {
                resolve(pictures.map(picture => picture.url));
            });`;
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await Engine.Request.fetchUI(request, script);
            callback(null, data);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}