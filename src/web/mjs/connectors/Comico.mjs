import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Comico extends Connector {

    constructor() {
        super();
        super.id = 'comico';
        super.label = 'Comico (コミコ)';
        this.tags = [ 'webtoon', 'japanese' ];
        this.url = 'https://www.comico.jp';

        this.categories = [
            'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'finish',
            null // magic key for challenge endpoint
        ];
    }

    _getTitleNumber(href) {
        let uri = new URL(href, this.url);
        return uri.searchParams.get('titleNo');
    }

    async _fetchPOST(path, parameters) {
        let uri = new URL(path, this.url);
        let request = new Request(uri, {
            method: 'POST',
            body: new URLSearchParams(parameters).toString(),
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        });
        let response = await fetch(request);
        return response.json();
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.article-hero09__ttl');
        let id = this._getTitleNumber(uri.href);
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let category of this.categories) {
            for(let page = 1, run = true; run; page++) {
                let mangas = await this._getMangasFromPage(category, page);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(day, page) {
        let endpoint = day ? '/official' : '/challenge';
        let data = await this._fetchPOST(endpoint + '/updateList.nhn', { day, page });
        return !data.result ? [] : data.result.list.map(manga => {
            return {
                id: this._getTitleNumber(manga.title_url),
                title: manga.title_name
            };
        });
    }

    async _getChapters(manga) {
        let data = await this._fetchPOST('/api/getArticleList.nhn', { titleNo: manga.id });
        return data.result.list
            .filter(chapter => chapter.isPurchased || chapter.freeFlg === 'Y')
            .map(chapter => {
                return {
                    id: chapter.articleNo,
                    title: chapter.subtitle,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let uri = new URL('/detail.nhn', this.url);
        uri.searchParams.set('titleNo', chapter.manga.id);
        uri.searchParams.set('articleNo', chapter.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comic-image source.comic-image__image');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}