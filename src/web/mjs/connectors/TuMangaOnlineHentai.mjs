import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TuMangaOnlineHentai extends Connector {

    constructor() {
        super();
        super.id = 'tumangaonlinehentai';
        super.label = 'TMOHentai';
        this.tags = ['hentai', 'spanish'];
        this.url = 'https://tmohentai.com';
        this.links = {
            login: 'https://tmohentai.com/login'
        };
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.panel-title div.panel-heading h3');
        let id = uri.pathname.split('/').pop();
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, hasNext = true; hasNext; page++) {
            let request = new Request(this.url + '/section/all?view=list&order=alphabetic&page=' + page, this.requestOptions);
            const body = (await this.fetchDOM(request, 'body'))[0];
            let data = [...body.querySelectorAll('div.panel-body table.table tbody tr td.text-left a')];
            let mangas = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace('/contents/', ''),
                    title: element.text.trim()
                };
            });
            mangaList.push(...mangas);
            hasNext = !body.querySelector('ul.pagination li:first-child + li[class*="disabled"]');
        }
        return mangaList;
    }

    async _getChapters(manga) {
        return [{
            id: manga.id,
            title: manga.title,
            language: ''
        }];
    }

    async _getPages(chapter) {
        let request = new Request(`${this.url}/reader/${chapter.id}/cascade`, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content-images source.content-image');
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element.dataset['original'] || element, request.url)));
    }
}
