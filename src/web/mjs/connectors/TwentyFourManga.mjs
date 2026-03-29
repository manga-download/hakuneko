import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class TwentyFourManga extends Connector {
    constructor() {
        super();
        super.id = '24manga';
        super.label = '24Manga';
        this.tags = [ 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://24manga.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'header > h1');
        let title = data.textContent.trim();
        let id = uri.pathname;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/manga/', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.wp-block-coblocks-posts__content a');
        for(let element of data) {
            let title = element.textContent.trim();
            mangaList.push({
                id: element.pathname,
                title: title
            });
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.wp-block-latest-posts__list li a');
        return data.filter(x => x.pathname.includes('chapter')).map(element => {
            let title = element.textContent.split(' – ')[1];
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'figure > div > div > source');
        return data.map(element => {
            return element.src.split('?')[0].replace(/https:\/\/i\d+.wp.com\//, 'http://');
        });
    }
}