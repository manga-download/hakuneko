import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Alphapolis extends Connector {

    constructor() {
        super();
        super.id = 'alphapolis';
        super.label = 'ALPHAPOLIS (アルファポリス)';
        this.tags = ['manga', 'japanese', 'hentai'];
        this.url = 'https://www.alphapolis.co.jp';
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/manga/official/search', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.paginator.section span a[rel="last"]');
        const pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/manga/official/search?page=${page}`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.official-manga-panel > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.title').textContent.replace('[R18]', '').trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.manga-detail-description > div.title');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'viewer-manga-horizontal');
        try {
            const pages = JSON.parse(data[0].getAttribute('v-bind:pages'));
            return pages.filter(element => typeof element != 'object' && !element.match('white_page'))
                .map(element => {
                    const hiresPicture = element.replace(/\/[0-9]+x[0-9]+.([\w]+)/, '/1080x1536.$1');
                    return this.createConnectorURI({hiresPicture : hiresPicture, normalpicture : element});
                });
        } catch (error) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.episode-unit');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.read-episode'), this.url),
                title: element.querySelector('div.title').textContent.trim()
            };
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.hiresPicture, this.requestOptions);
        let response = await fetch(request);
        if (response.status != 200) {
            request = new Request(payload.normalpicture, this.requestOptions);
            response = await fetch(request);
        }
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

}
