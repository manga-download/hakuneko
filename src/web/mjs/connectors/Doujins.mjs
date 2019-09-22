import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Doujins extends Connector {

    constructor() {
        super();
        super.id = 'doujins';
        super.label = 'Doujins';
        this.tags = ['hentai', 'english'];
        this.url = 'https://doujins.com';
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    async _getMangaFromURI(uri) {
        try {
            let data = await this.fetchDOM(uri.href, 'head title', 3);
            let id = uri.pathname;
            let title = data[0].textContent.trim();
            return Promise.resolve(new Manga(this, id, title));
        } catch(error) {
            return null;
        }
    }

    async _getMangaList(callback) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        callback(new Error(msg), undefined);
    }

    async _getChapterList(manga, callback) {
        try {
            let chapterList = [ Object.assign({ language: '' }, manga) ];
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'source.doujin');
            let pageList = data.map(element => this.getAbsolutePath(element.dataset.file, request.url));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}