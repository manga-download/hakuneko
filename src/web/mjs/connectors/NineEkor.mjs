import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NineEkor extends Connector {

    constructor() {
        super();
        super.id = '9ekor';
        super.label = '9ekor';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://9ekor.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'main.site-main header.page-header h1.entry-title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/daftar-isi/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.letter-section ul.columns li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(`${manga.id}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'article.post h3.entry-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace(/Baca komik/i, '').replace(/Bahasa Indonesia/i, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'main.site-main div.page-content p source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}