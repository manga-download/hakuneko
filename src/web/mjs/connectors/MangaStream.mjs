import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 */
export default class MangaStream extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangastream';
        super.label = 'MangaStream';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://readms.net';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        fetch( this.url + '/manga', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let mangaList = [...dom.querySelectorAll( 'table.table-striped tbody tr td strong a' )].map( element => {
                    return {
                        id: this.getRelativeLink( element ),
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
    _getChapterList( manga, callback ) {
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let chapterList = [...dom.querySelectorAll( 'table.table-striped tbody tr td a' )].map( element => {
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
        this.fetchDOM( request, 'div.btn-reader-page ul.dropdown-menu li a' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                pageList = this._interpolatePages( pageList ).map( page => this.createConnectorURI( page ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     * Try to interpolate missing pages between last page and its preceding page
     */
    _interpolatePages( pageList ) {
        let result = pageList;
        try {
            let last = result.length - 1;
            let forelast = result.length - 2;
            if( forelast < 0 ) {
                throw new Error( 'Cannot interpolate less than two pages!' );
            }

            let partsForelast = result[forelast].split( '/' );
            forelast = parseInt( partsForelast.pop() );
            partsForelast = partsForelast.join( '/' );

            let partsLast = result[last].split( '/' );
            last = parseInt( partsLast.pop() );
            partsLast = partsLast.join( '/' );

            if( partsForelast !== partsLast ) {
                throw new Error( 'Cannot interpolate non-sequiential URLs!' );
            }
            if( isNaN(last) || isNaN(forelast) ) {
                throw new Error( 'Cannot interpolate non-numeric sequences!' );
            }
            if( last - forelast < 2 ) {
                throw new Error( 'Cannot interpolate between consecutive numbers!' );
            }
            if( last - forelast > 100 ) {
                throw new Error( 'Cannot interpolate more than 100 pages (might be an unsupported sequence rule)!' );
            }

            result.pop();
            for( let i = forelast+1; i<=last; i++ ) {
                result.push( `${partsLast}/${i}` );
            }
        } catch(error) {
            //
        }
        return result;
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
        return this.fetchDOM( request, 'source#manga-page' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
    }
}