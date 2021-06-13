import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kanjiku extends Connector {

    constructor() {
        super();
        super.id = 'kanjiku';
        super.label = 'Kanjiku';
        this.tags = [ 'manga', 'webtoon', 'german' ];
        this.url = 'https://kanjiku.net';
        this.requestOptions.headers.set('x-cookie', 'clicked=true');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container h1.manga_page_title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/mangas', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga_flex-row a.manga_box');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tab1 div.manga_overview_box a.latest_ch_number');
        return data.map(element => {
            let payload = {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace(/.$/, '0'),
                title: element.text,
            };
            return payload;
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container source');
        return data.map(image => this.getAbsolutePath(image, this.url).replace(/.{24}$/, ''));
    }
}
