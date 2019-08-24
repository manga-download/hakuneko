import Connector from '../engine/Connector.mjs';

export default class Samples extends Connector {

    constructor() {
        super();
        super.id = 'template';
        super.label = 'Template';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://template.net';
    }

    /**
     *
     */
    /*
     * OVERWRITE WHEN INITIALIZATION SHALL BE PERFORMED BEFORE ACCESSING WEBSITE
     * e.g. Bypass CloudFlare protection
     * _initializeConnector() {
     * let uri = new URL( this.url );
     * uri.searchParams.set( 'ts', Date.now() );
     * uri.searchParams.set( 'rd', Math.random() );
     * let request = new Request( uri.href, this.requestOptions );
     * return Engine.Request.fetchUI( request, '' );
     * }
     */

    /**
     *
     */
    /*
     * Overwrite default from connector
     * _getMangaFromURI( uri ) {
     * let request = new Request( uri.href, this.requestOptions );
     * return this.fetchDOM( request, 'h1' )
     * .then( data => {
     * let id = uri.pathname + uri.search;
     * let title = data[0].textContent.trim();
     * return Promise.resolve( new Manga( this, id, title ) );
     * } );
     * }
     */

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/mangas', this.requestOptions );
        this.fetchDOM( request, 'ul.mangas li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     ** VARIANT WITH PAGINATION ***
     *
     * _getMangaListFromPages( mangaPageLinks, index ) {
     * index = index || 0;
     * let request = new Request( mangaPageLinks[ index ], this.requestOptions );
     * return this.fetchDOM( request, 'ul.mangas li a', 5 )
     * .then( data => {
     * let mangaList = data.map( element => {
     * return {
     * id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
     * title: element.text.trim()
     * };
     * } );
     * if( index < mangaPageLinks.length - 1 ) {
     * return this._getMangaListFromPages( mangaPageLinks, index + 1 )
     * .then( mangas => mangaList.concat( mangas ) );
     * } else {
     * return Promise.resolve( mangaList );
     * }
     * } );
     * }
     *
     * _getMangaList( callback ) {
     * let request = new Request( this.url + '/mangas/1', this.requestOptions );
     * this.fetchDOM( request, 'ul.pagination li:last-of-type a' )
     * .then( data => {
     * let pageCount = parseInt( data[0].text.trim() );
     * let pageLinks = [...( new Array( pageCount ) ).keys()].map( page => this.url + '/mangas/' + ( page + 1 ) );
     * return this._getMangaListFromPages( pageLinks );
     * } )
     * .then( data => {
     * callback( null, data );
     * } )
     * .catch( error => {
     * console.error( error, this );
     * callback( error, undefined );
     * } );
     * }
     */

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'ul.chapters li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
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

    /**
     ** VARIANT WITH PAGINATION ***
     *
     * _getChapterListFromPages( manga, chapterPageLinks, index ) {
     * index = index || 0;
     * let request = new Request( chapterPageLinks[ index ], this.requestOptions );
     * return this.fetchDOM( request, 'ul.chapters li a', 5 )
     * .then( data => {
     * let chapterList = data.map( element => {
     * return {
     * id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
     * title: element.text.replace( manga.title, '' ).trim(),
     * language: ''
     * };
     * } );
     * if( index < chapterPageLinks.length - 1 ) {
     * return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
     * .then( chapters => chapterList.concat( chapters ) );
     * } else {
     * return Promise.resolve( chapterList );
     * }
     * } );
     * }
     *
     * _getChapterList( manga, callback ) {
     * let request = new Request( this.url + manga.id, this.requestOptions );
     * this.fetchDOM( request, 'ul.pagination li:last-of-type a' )
     * .then( data => {
     * let pageCount = parseInt( data[0].text.trim() );
     * let pageLinks = [...( new Array( pageCount ) ).keys()].map( page => this.url + manga.id + '/' + ( page + 1 ) );
     * return this._getChapterListFromPages( manga, pageLinks );
     * } )
     * .then( data => {
     * callback( null, data );
     * } )
     * .catch( error => {
     * console.error( error, manga );
     * callback( error, undefined );
     * } );
     * }
     */

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div#viewer source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     ** VARIANT WITH PROTOCOL HANDLER ***
     *
     * _getPageList( manga, chapter, callback ) {
     * let request = new Request( this.url + chapter.id, this.requestOptions );
     * this.fetchDOM( request, 'div#viewer source' )
     * .then( data => {
     * let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element, request.url ) ) );
     * callback( null, pageList );
     * } )
     * .catch( error => {
     * console.error( error, chapter );
     * callback( error, undefined );
     * } );
     * }
     *
     * _handleConnectorURI( payload ) {
     * let request = new Request( payload, this.requestOptions );
     * // TODO: only perform requests when from download manager
     * // or when from browser for preview and selected chapter matches
     * return this.fetchDOM( request, 'div#image source' )
     * .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
     * }
     */
}