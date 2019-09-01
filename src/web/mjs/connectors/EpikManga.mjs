import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 * Seems to be customized FlatManga CMS
 * Very similar to Puzzmos
 */
export default class EpikManga extends Connector {

    constructor() {
        super();
        super.id = 'epikmanga';
        super.label = 'Epik Manga';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.epikmanga.com';
    }

    async _getMangaFromURI(uri) {
        try {
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'head title');
            let id = uri.pathname;
            let title = data[0].text.split(' | ')[0].trim();
            return new Manga(this, id, title);
        } catch(error) {
            return error;
        }
    }

    async _getMangaList(callback) {
        try {
            let request = new Request(this.url + '/seri-listesi?type=text', this.requestOptions);
            let data = await this.fetchDOM(request, 'div#pop-href div[id^=char-] a');
            let mangaList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            });
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'table.table tbody tr td:first-of-type a');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim(),
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
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div#reader div.chapter-content source.chapter-img');
            let pageList = data.map(element => this.getAbsolutePath(element, request.url));
            callback(null, pageList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}