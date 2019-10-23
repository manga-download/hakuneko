import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicWalker extends Connector {

    constructor() {
        super();
        super.id = 'comicwalker';
        super.label = 'コミックウォーカー (ComicWalker)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-walker.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#mainContent div#detailIndex div.comicIndex-box h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return Promise.resolve(new Manga(this, id, title));
    }

    async _getMangaListPage(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comicPage ul.tileList li a p.tileTitle span');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.replace(/^[^\s]+\s/, '').trim()
            };
        });
    }

    async _getMangaList(callback) {
        try {
            let mangaList = [];
            for(let language of ['en', 'tw', 'jp']) {
                let uri = new URL('/contents/list/', this.url);
                let request = new Request(`${this.url}/set_lang/${language}/`, this.requestOptions);
                request.headers.set('x-referer', uri.href);
                let data = await this.fetchDOM(request, 'div.comicPage div.pager ul.clearfix li:nth-last-of-type(2) a');
                let pageCount = parseInt(data[0].text.trim());
                for(let page = 1; page <= pageCount; page++) {
                    uri.searchParams.set('p', page);
                    let mangas = await this._getMangaListPage(uri);
                    mangaList.push(...mangas);
                }
            }
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div#ulreversible ul#reversible li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div#cw-viewer' )
            .then( data => {
                let uri = `${data[0].dataset.apiEndpointUrl}/api/v1/comicwalker/episodes/${data[0].dataset.episodeId}/frames`;
                request = new Request( uri, this.requestOptions );
                return this.fetchJSON( request );
            } )
            .then( data => {
                let pageList = data.data.result.map( page => this.createConnectorURI( this.getAbsolutePath( page.meta.source_url, this.url ) ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let passphrase = payload.split('/')[6];
        if(passphrase) {
            let request = new Request(payload, this.requestOptions);
            let response = await fetch(request);
            return this._decrypt(await response.arrayBuffer(), passphrase);
        } else {
            return super._handleConnectorURI(payload);
        }
    }

    _decrypt(encrypted, passphrase) {
        let key = this._generateKey(passphrase);
        let decrypted = this._xor(encrypted, key);
        return Promise.resolve({
            mimeType: 'image/jpeg',
            data: decrypted
        });
    }

    /**
     ******************************
     * ** COMIC-WALKER CODE BEGIN ***
     *****************************
     */

    _generateKey(t) {
        var e = t.slice(0, 16).match(/[\da-f]{2}/gi);
        if (null != e)
            return new Uint8Array(e.map(function(t) {
                return parseInt(t, 16);
            }));
        throw new Error("failed generate key.");
    }

    _xor(t, e) {
        for (var n = new Uint8Array(t), r = n.length, i = e.length, o = new Uint8Array(r), a = 0; a < r; a += 1)
            o[a] = n[a] ^ e[a % i];
        return o;
    }

    /**
     ****************************
     * ** COMIC-WALKER CODE END ***
     ***************************
     */
}