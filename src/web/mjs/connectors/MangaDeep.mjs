import Connector from '../engine/Connector.mjs';

export default class MangaDeep extends Connector {

    constructor() {
        super();
        super.id = 'mangadeep';
        super.label = 'MangaDeep';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.mangadeep.com';
    }

    // http://www.manga99.com

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/ajax/new_manga/page-' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'li dd.book-list > a:first-of-type');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        uri.searchParams.set('waring', '1');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.chapter-box li div.chapter-name.short a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.firstChild.textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'select.sl-page option');
        return data.map(option => this.createConnectorURI(this.getAbsolutePath(option.value, request.url)));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let request = new Request(new URL(payload, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pic_box source.manga_pic');
        return super._handleConnectorURI(this.getAbsolutePath(data[0].src, request.url));
    }
}