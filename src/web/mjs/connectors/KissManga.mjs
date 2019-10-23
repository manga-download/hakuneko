import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KissManga extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'kissmanga';
        super.label = 'KissManga';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://kissmanga.com';
        this.pageLoadDelay = 5000;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#leftside div.barContent a.bigChar', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     * Parameters mangalist and page should never be used by external calls.
     */
    _getMangaList( callback ) {
        fetch( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
            } )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
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

    /**
     *
     */
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
                    resolve(lstImages);
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