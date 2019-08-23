import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaFox extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangafox';
        super.label = 'MangaFox';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://fanfox.net';
        this.requestOptions.headers.set( 'x-cookie', 'isAdult=1' );
        this.pageLoadDelay = 50;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;

        // this script uses chapterfun.ashx instead of chapter_bar.js as in MangaHere
        this.scriptSource = 'chapterfun.ashx';
    }

    /**
     *
     */
    get script() {
        return `
                let result;
                if( isbarchpater /*document.querySelector( 'div.cp-pager-list a[data-page]'*/ ) {
                    result = new Promise( ( resolve, reject ) => {
                        let images = document.querySelectorAll( 'div.reader-main img.reader-main-img' );
                        images = [...images].map( image => new URL( image.dataset['src'], window.location.href ).href );
                        resolve( images );
                    } );
                } else {
                    let promises = [...( new Array( imagecount ) ).keys()].map( p => {
                        return Promise.resolve()
                        .then( () => {
                            return {
                                url: '${this.scriptSource}',
                                data: {
                                    cid: chapterid,
                                    page: p+1,
                                    key: guidkey
                                }
                            };
                        } )
                        .then( request => $.ajax( request ) )
                        .then( script => {
                            eval( script );
                            let anchor = document.createElement( 'a' );
                            anchor.href = d[0];
                            return Promise.resolve( anchor.href );
                        } );
                    } );
                    result = Promise.all( promises );
                }
                result;
            `;
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    _getMangaFromURI( uri ) {
        return this.fetchDOM( uri.href, 'div.detail-info div.detail-info-right p.detail-info-right-title span.detail-info-right-title-font', 3 )
            .then( data => {
                let id = uri.pathname + uri.search;
                let title = data[0].innerText.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.manga-list-1 ul li p.manga-list-1-item-title a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.title.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/directory/', 'div.pager-list div.pager-list-left a:nth-last-child(2)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [...( new Array( pageCount ) ).keys()].map( page => this.url + '/directory/' + ( page + 1 ) + '.htm' );
                return this._getMangaListFromPages( pageLinks );
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
        return this.fetchDOM( this.url + manga.id, 'div#chapterlist ul li a' )
            .then( data => {
                // TODO: license element check ... (e.g. ???)
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.querySelector( 'p.title3' ).innerText.replace( manga.title, '' ).trim(),
                        language: 'english'
                    };
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
        this._getPageListDesktop( manga, chapter, callback );
        //this._getPageListMobile( manga, chapter, callback );
    }

    /**
     *
     */
    _getPageListDesktop( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, this.script )
            .then( pageList => {
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getPageListMobile( manga, chapter, callback ) {
        let uri = new URL( this.url + chapter.id );
        uri.hostname = 'm.' + uri.hostname;
        uri.pathname = uri.pathname.replace( '/manga/', '/roll_manga/' );
        fetch( uri.href, this.requestOptions )
            .then( response => {
                // FIXME: very dangerous, might end up in endless recursion !!!
                if( response.status === 503 || response.status === 504 ) {
                    setTimeout( () => {
                        this._getPageList( manga, chapter, callback );
                    }, this.pageLoadDelay );
                    return;
                }
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                if( dom.querySelector( 'span.fwb' ) && data.indexOf( 'licensed' ) > -1 ) {
                    throw new Error( 'The manga is licensed and not available in your country!' );
                }
                let pageList = [...dom.querySelectorAll( 'div#viewer source' )];
                pageList = pageList.map( element => {
                    return element.dataset.original;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}