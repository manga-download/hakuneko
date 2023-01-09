import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaTepesi extends Connector {
    constructor() {
        super();
        super.id = 'mangatepesi';
        super.label = 'MangaTepesi';
        this.tags = ['manga', 'webtoon', 'turkish', 'scanlation'];
        this.url = 'https://www.mangatepesi.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.about-manga-info h2');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const request = new Request(new URL('/mangalistesi', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'article.manga-card > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.href, this.url),
                title: element.querySelector('div.manga-card-mName').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#manga-chapters-item-list a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.href, this.url),
                title: element.querySelector('div.manga-chapters-item-title').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source.read-manga-image:not([style])');
        return data.map(image => {
            return this.getAbsolutePath( image.src, this.url );
        });
    }
}
