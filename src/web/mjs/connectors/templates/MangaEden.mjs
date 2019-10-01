import Connector from '../../engine/Connector.mjs';

export default class MangaEden extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'table#mangaList tr td:first-of-type a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
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
        this.fetchDOM( this.url + this.urlMangas, 'div.pagination a:nth-last-child(2)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + this.urlMangas + '?page=' + ( page + 1 ) );
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
        this.fetchDOM( this.url + manga.id, 'table tr td a.chapterLink' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: this.id.split( '-' )[1]
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
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                if( data.indexOf( 'licensed in your country' ) > -1 ) {
                    throw new Error( 'The manga is licensed and not available in your country!' );
                }
                let pages = JSON.parse( data.match( /pages\s*=\s*(\[.*?\])\s*;/ )[1] );
                let pageList = pages.map( page => this.createConnectorURI( this.getAbsolutePath( page.fs, request.url ) ) );
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
        if( uri.hostname === 'cdn.mangaeden.com' ) {
            this.requestOptions.headers.set( 'x-host', uri.hostname );
            uri.hostname = '188.165.13.96';
            uri.protocol = 'http';
        }
        let promise = super._handleConnectorURI( uri.href );
        this.requestOptions.headers.delete( 'x-host' );
        return promise;
    }
}