import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaHasu extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangahasu';
        super.label = 'MangaHasu';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://mangahasu.se';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    /**
     *
     */
    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL( this.url + '/0/0.html' );
        uri.searchParams.set( 'ts', Date.now() );
        uri.searchParams.set( 'rd', Math.random() );
        let request = new Request( uri.href, this.requestOptions );
        return Engine.Request.fetchUI( request, '' );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'ul.list_manga li a.name-manga', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } );
                if( mangaList.length > 0 && index < mangaPageLinks.length - 1 ) {
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
        this.fetchDOM( this.url + '/directory.html', 'div.pagination-ct a:last-of-type' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match(/(\d+)$/)[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/directory.html?page=' + ( page + 1 ) );
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
        this.fetchDOM( this.url + manga.id, 'div.list-chapter table tr td.name a' )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.img-chapter div.img source' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element, request.url ) ) );
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
    _handleConnectorURI( payload ) {
        let uri = new URL( payload );
        uri.searchParams.set( 't', Date.now().toString().slice( 0, -3 ) );
        return super._handleConnectorURI( uri.href );
    }
}