import Connector from '../engine/Connector.mjs';

export default class HeavenManga extends Connector {

    constructor() {
        super();
        super.id = 'heavenmanga';
        super.label = 'Heaven Manga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://ww4.heavenmanga.org';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL( this.url );
        uri.searchParams.set( 'ts', Date.now() );
        uri.searchParams.set( 'rd', Math.random() );
        let request = new Request( uri.href, this.requestOptions );
        return Engine.Request.fetchUI( request, '' )
            .then(() => fetch(request))
            .then(response => {
                this.url = new URL( response.url ).origin;
                return Promise.resolve();
            });
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.comics-grid div.entry div.content h3.name a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
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
        this.fetchDOM( this.url + '/manga-list/', 'div.pagination-container div.pagination a.next:last-of-type' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /(\d+)$/ )[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => `${this.url}/manga-list/page-${page + 1}/` );
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
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( chapterPageLinks[ index ], 'div#chapterList div.chapters-wrapper div.r1 h2.chap a', 5 ) )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
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
        this.fetchDOM( this.url + manga.id, 'div.pagination-container div.pagination a.next:last-of-type' )
            .then( data => {
                let pageCount = data.length === 0 ? 1 : parseInt( data[0].href.match( /(\d+)$/ )[1] ) ;
                let pageLinks = [... new Array( pageCount ).keys()].map( page => `${this.url}${manga.id}/page-${page + 1}/` );
                return this._getChapterListFromPages( manga, pageLinks );
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
    _getPageList( manga, chapter, callback ) {
        this.fetchDOM( this.url + chapter.id, 'div.chapter-content-inner source' )
            .then( data => {
                let pageList = data.map( element => element.src );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}