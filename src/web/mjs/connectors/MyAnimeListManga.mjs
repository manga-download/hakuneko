import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MyAnimeListManga extends Connector {

    constructor() {
        super();
        super.id = 'myanimelistmanga';
        super.label = 'MyAnimeList (Manga)';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://myanimelist.net';
        this.links = {
            login: 'https://myanimelist.net/login.php'
        };
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 500
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname.split('/').pop();
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/store/search?p=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.items a.item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.v-manga-store-purchase-bulk-button');
        const jObject= JSON.parse(data[0].dataset['items']);
        return jObject.filter(element => element.is_previewable || element.is_free || element.is_possessed)
            .filter(element => !element.viewer_url.includes('novel_viewer'))
            .map(element => {
                const isPossessed = !element.is_possessed ? false : element.is_possessed; //value can be null instead of false
                const isFull = element.is_free || isPossessed;
                let title = element.numbering_text.trim();
                title += isFull ? '' : ' [Preview]';
                return {
                    id: this.getRootRelativeOrAbsoluteLink(isFull ? element.viewer_url : element.preview_url, this.url),
                    title: title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        //TODO : add support for light novels  : its modified Publus reader
        const url = new URL(chapter.id, this.url);
        let request = new Request(url, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.v-manga-store-viewer');
        if(data.length === 0) {
            throw new Error('You must first login to see this page!');
        }
        data = JSON.parse(data[0].dataset.state);
        return data.manuscript.filenames.map(file => {
            let uri = new URL(data.manuscript.image_base_url + '/' + file);
            uri.search = data.manuscript.query_params_part;
            return this.createConnectorURI({imageUrl : uri.href, referer : url, mode : 'xor'});
        });
    }

    async _handleConnectorURI(payload) {
        await this.wait(this.config.throttle.value);
        //handling modes already in case of future addition of light novels support
        switch(payload.mode) {
            case 'xor': {
                const Xreferal = new URL(payload.referer);
                let request = new Request(payload.imageUrl, this.requestOptions);
                request.headers.set('Accept', 'application/json, text/plain, */*');
                request.headers.set('X-Requested-With', 'XMLHttpRequest');
                request.headers.set('X-Referral-Path', Xreferal.pathname );
                request.headers.set('x-origin', this.url);
                request.headers.set('x-referer', payload.referer);
                let response = await fetch(request);
                let data = await response.arrayBuffer();
                return {
                    mimeType: response.headers.get('content-type'),
                    data: this._decryptImage(data)
                };
            }

            case 'puzzle' : {
                //
            }
        }
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
