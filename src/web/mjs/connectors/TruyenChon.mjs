import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class TruyenChon extends Connector {

    /**
     * Same as NetTruyen
     */
    constructor() {
        super();
        super.id = 'truyenchon';
        super.label = 'TruyenChon';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://truyenchon.com';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.ModuleContent div.items div.item figcaption a.jtip', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/?page=', this.requestOptions );
        this.fetchDOM( request, 'div.pagination-outter ul.pagination li:last-of-type a' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match(/\d+$/)[0] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div.list-chapter ul li.row div.chapter a' )
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
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.reading div.page-chapter source' )
            .then( data => {
                let pageLinks = data.map( element => {
                    let uri = this.getAbsolutePath( element, request.url );
                    return uri.includes( 'proxy.' ) ? this.createConnectorURI( { url: uri, referer: request.url } ) : uri;
                } );
                callback( null, pageLinks );
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
        try {
            let request = new Request( payload.url, this.requestOptions );
            request.headers.set( 'x-referer', payload.referer );
            return fetch( request )
                .then( response => response.blob() )
                .then( data => this._blobToBuffer( data ) );
        } catch( error ) {
            return Promise.reject( error );
        }
    }
}