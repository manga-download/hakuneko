import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SheaManga extends Connector {

    constructor() {
        super();
        super.id = 'sheamanga';
        super.label = 'Shea Manga';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://www.sheamanga.my.id';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'article.post div.manga_post h2.entry-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'article.post table#mg_pglist tbody tr');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('td a'), request.url),
                title: element.querySelector('td').textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                if(pages && pages.length) {
                    resolve(pages);
                } else {
                    resolve([...document.querySelectorAll('div.entry-content div.separator img')].map(img => img.src));
                }
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }
}