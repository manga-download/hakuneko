import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewType extends Connector {

    constructor() {
        super();
        super.id = 'newtype';
        super.label = 'NewType';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic.webnewtype.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.Breadcrumb ul li:last-of-type');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _fetchJsonDOM(request, page, query) {
        let data = await this.fetchJSON(request);
        if(data.next !== page) {
            let blobURL = URL.createObjectURL(new Blob([data.html], { type: 'text/html' }));
            data = await this.fetchDOM(new Request(blobURL, this.requestOptions), query);
            URL.revokeObjectURL(blobURL);
        } else {
            data = [];
        }
        return data;
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
        let request = new Request(new URL(`/contents/all/more/${page}/`, this.url), this.requestOptions);
        let data = await this._fetchJsonDOM(request, page, 'li a div.OblongCard-content h3.OblongCard-title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request(new URL(`${manga.id}/more/${page}/`, this.url), this.requestOptions);
        let data = await this._fetchJsonDOM(request, page, 'li a div.description');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#viewerContainer');
        let link = this.getAbsolutePath(data[0].dataset.url, request.url);
        data = await this.fetchJSON(new Request(link, this.requestOptions));
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}