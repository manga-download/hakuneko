import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KissManga extends Connector {

    constructor() {
        super();
        super.id = 'kissmanga';
        super.label = 'KissManga';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        this.url = 'https://kissmanga.com';
        this.listLoadDelay = 2750;
        this.pageLoadDelay = 5000;
        this.requestOptions.headers.set('x-cookie', 'vns_readType1=0');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#leftside div.barContent a.bigChar', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/MangaList', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination ul.pager li:last-of-type a');
        let pageCount = parseInt(data[0].getAttribute('page'));
        for(let page = 1; page <= pageCount; page++) {
            await this.wait(this.listLoadDelay);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/MangaList?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'table.listing tbody tr td:first-of-type a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace(/\s+/g, ''),
                title: element.text.trim()
            };
        });
    }

    _getChapterList( manga, callback ) {
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                if( data.indexOf( 'g-recaptcha' ) > -1 || data.indexOf( 'sweetcaptcha' ) > -1 || data.indexOf( 'http://api.solvemedia.com') > -1 ) {
                    throw new Error( 'Failed to get chapter from ' + this.label + ' due to captcha protection!' );
                }
                let chapterList = [];
                let dom = this.createDOM( data );
                [...dom.querySelectorAll( 'table.listing tr' )].forEach( element => {
                    let td = element.querySelector( 'td' );
                    if( td ) {
                        let a = td.querySelector( 'a' );
                        if( a && a.href ) {
                            this.cfMailDecrypt( a );
                            chapterList.push( {
                                /*
                                 * https://kissmanga.com/Manga/29-sai-Dokushin-wa-Isekai-de-Jiyuu-ni-Ikita……katta => Contains special characters
                                 * https://kissmanga.com/Manga/Kino-no-Tabi- the-Beautiful-World-SHIOMIYA-Iruka => Contains unescaped space
                                 */
                                id: this.getRootRelativeOrAbsoluteLink( a, this.url ),
                                title: a.text.replace( /read online/i, '' ).replace( manga.title, '' ).trim(),
                                language: 'en'
                            });
                        }
                    }
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    _getPageList( manga, chapter, callback ) {
        if( this.isLocked ) {
            console.warn( `[WARN: ${this.label}, too many requests]` );
            callback( new Error( 'Request to ' + this.label + ' has been skipped to prevent the client from beeing blocked for to many requests!' ), [] );
            return;
        }
        let key = this.lock();
        setTimeout( () => {
            this.unlock( key );
        }, this.pageLoadDelay );
        let script = `
            new Promise(resolve => {
                // cookie: vns_readType1=0 => one page (lstImages)
                // cookie: vns_readType1=1 => all pages (lstOLA)
                if(this.lstOLA && this.lstOLA.length > 0) {
                    resolve(this.lstOLA);
                } else {
                    resolve(this.lstImages);
                }
            });
        `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageList = data.map( link => new URL( link, this.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}
