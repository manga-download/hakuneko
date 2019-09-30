import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Mexat extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mexat';
        super.label = 'مانجا مكسات (Mexat)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://manga.mexat.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/قائمة-المانجا/', this.requestOptions );
        this.fetchDOM( request, 'div.content ul.MangaList li div.SeriesName a' )
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
     *
     */
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        index = index || 0;
        let request = new Request( chapterPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div#main-content div.content table tbody tr td:nth-of-type(2) a', 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim() + ' - ' + element.title.replace( 'رابط ثابت لـ', '' ).trim(),
                        language: ''
                    };
                } );
                if( index < chapterPageLinks.length - 1 ) {
                    return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div#main-content div.content div.pagination a.last' )
            .then( data => {
                let pageLinks = [ request.url ];
                if( data.length > 0 ) {
                    let pageCount = parseInt( data[0].href.match( /\/(\d+)\/?$/ )[1] );
                    pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + 'page/' + ( page + 1 ) + '/' );
                }
                return this._getChapterListFromPages( manga, pageLinks );
            } )
            .then( data => {
                callback( null, data );
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
        this.fetchDOM( request, 'div.content div.manga-filter select#manga_pid option' )
            .then( data => {
                let pageList = data.map( element => {
                    let uri = new URL( request.url );
                    uri.searchParams.set( 'pid', element.value );
                    return this.createConnectorURI( uri.href );
                } );
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
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return this.fetchDOM( request, 'div.content div.post-inner div.pic a source' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
    }
}