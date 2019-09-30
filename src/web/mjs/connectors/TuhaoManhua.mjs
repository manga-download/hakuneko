import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class TuhaoManhua extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'tuhaomanhua';
        super.label = '土豪漫画 (Tuhao Manhua)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'https://www.tohomh123.com';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'ul.mh-list li div.mh-item h2.title a', 5 ) )
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
        this.fetchDOM( this.url + '/f-1------updatetime--9999.html', 'div.page-pagination ul li:last-of-type a.active' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/f-1------updatetime--' + ( page + 1 ) + '.html' );
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
        this.fetchDOM( this.url + manga.id, 'div#chapterlistload ul#detail-list-select-1 li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.childNodes[0].nodeValue.trim(),
                        language: 'zh'
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
                let uri = new URL( this.url + '/action/play/read' );
                uri.searchParams.set( 'did', data.match( /var\s+did\s*=\s*(\d+)\s*;/ )[1] );
                uri.searchParams.set( 'sid', data.match( /var\s+sid\s*=\s*(\d+)\s*;/ )[1] );
                let pageCount = parseInt( data.match( /var\s+pcount\s*=\s*(\d+)\s*;/ )[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => {
                    uri.searchParams.set( 'iid', page + 1 );
                    uri.searchParams.set( 'tmp', Math.random() );
                    return this.createConnectorURI( uri.href );
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
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return this.fetchJSON( request )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data.Code, request.url ) ) );
    }
}