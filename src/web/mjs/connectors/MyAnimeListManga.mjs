import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MyAnimeListManga extends Connector {

    constructor() {
        super();
        super.id = 'myanimelistmanga';
        super.label = 'MyAnimeList (Manga)';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://myanimelist.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname.split('/').pop();
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/read/manga', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'tr.ranking-list td.title div.detail > a:first-of-type');
        return data.map(element => {
            return {
                id: element.href.split('/').pop(),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL('/read/manga/detail/' + manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'table.top-ranking-table tr td div.detail a:first-of-type');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.v-manga-store-viewer');
        if(data.length === 0) {
            throw new Error('You must first login to see this page!');
        }
        data = JSON.parse(data[0].dataset.state);
        return data.manuscript.filenames.map(file => {
            let uri = new URL(data.manuscript.image_base_url + '/' + file);
            uri.search = data.manuscript.query_params_part;
            return this.createConnectorURI(uri.href);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let response = await fetch(request);
        let data = await response.arrayBuffer();
        return {
            mimeType: response.headers.get('content-type'),
            data: this._decryptImage(data)
        };
    }

    _decryptImage(encrypted) {
        // create a view for the buffer
        let data = new Uint8Array(encrypted);
        //let flag = data[0];
        let keySize = data[1];
        let key = data.slice(2, 2 + keySize);
        let decrypted = data.slice(2 + keySize);
        for(let index in decrypted) {
            decrypted[index] ^= key[index % key.length];
        }
        return decrypted;
    }
}