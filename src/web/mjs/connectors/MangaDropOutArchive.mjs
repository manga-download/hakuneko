import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaDropOutArchive extends Connector {

    constructor() {
        super();
        super.id = 'mangadropout-archive';
        super.label = 'MDO (Archive)';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://mangadropout.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div.card-body h4.card-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/collection', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/collection?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div.card-body');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.btn'), request.url),
                title: element.querySelector('h4.card-title b').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.list-group li.list-group-item a.cap');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.childNodes[0].textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        if(chapter.id.includes('generelatelink')) {
            let data = await this.fetchDOM(request, 'div#tidakakanselamanya a');
            request = new Request(this.getAbsolutePath(data[0], request.url), this.requestOptions);
        }
        let data = await this.fetchDOM(request, 'div.text-center source.lazy');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}