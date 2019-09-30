import Connector from '../../engine/Connector.mjs';

export default class AnyACG extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = undefined;
        this.path = '/browse?sort=title&page=';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;

        this.queryMangaPages = 'nav.pager ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#series-list div.item-text';
        this.queryChapters = 'div.chapter-list div.main a.chapt';
        this.language = '';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, this.queryMangas, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    let a = element.querySelector( 'a.item-title' );
                    let language = element.querySelector( 'span.item-flag' );
                    language = language ? ' (' + language.className.match( /flag_([_a-z]*)/ )[1].replace( /_/g, '-' ) + ')' : '';
                    this.cfMailDecrypt( a );
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( a, request.url ),
                        title: a.text.trim() + language
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
        let request = new Request( this.url + this.path, this.requestOptions );
        this.fetchDOM( request, this.queryMangaPages )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
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
        this.fetchDOM( request, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( /-?\s+Read\s+Online/i, '' ).trim(),
                        language: this.language
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
                let pages = data.match( /var\s+images\s*=\s*(\{.*\})\s*;/ )[1];
                let pageList = Object.values( JSON.parse( pages ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}