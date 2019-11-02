import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Luscious extends Connector {

    constructor() {
        super();
        super.id = 'luscious';
        super.label = 'Luscious';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://www.luscious.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#single_album_details li.album_cover h2');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPagesFromPage(chapter, page) {
        let part = chapter.id.split('/').filter(part => part !== '').pop();
        let path = ['', 'pictures', 'album', part, 'sorted', 'position', 'page', page, ''].join('/');
        let request = new Request(new URL(path, this.url), this.requestOptions);
        try {
            let data = await this.fetchDOM(request, 'div.picture_page div.thumbnail source.safe_link');
            return data.map(element => this.getAbsolutePath(element.dataset.src.replace(/\.\d+x\d+/, ''), request.url));
        } catch(error) {
            // catch 404 error when page number exceeds available pages
            return [];
        }
    }

    async _getPages(chapter) {
        let pageList = [];
        for(let page = 1; page > 0; page++) {
            let pages = await this._getPagesFromPage(chapter, page);
            pages.length > 0 ? pageList.push(...pages) : page = -1;
        }
        return pageList;
    }
}