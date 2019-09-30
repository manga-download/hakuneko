import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Tapas extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'tapas';
        super.label = 'Tapas';
        this.tags = [ 'webtoon', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://tapas.io';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( mangaPageLinks[ index ], 'ul.content-list-wrap li.content-item a.title', 5 )
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
        this.fetchDOM( this.url + '/comics?browse=ALL&sort_type=TITLE', 'div.global-pagination-wrap a.page-num' )
            .then( data => {
                let pageCount = parseInt( data.pop().text );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/comics?browse=ALL&sort_type=TITLE&pageNumber=' + ( page + 1 ) );
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
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let chapterList = JSON.parse( data.match( /episodeList\s*:\s*(\[.*?\])/ )[1] )
                //.filter( chapter => !chapter.locked )
                    .map( chapter => {
                        return {
                            id: '/episode/view/' + chapter.id,
                            title: chapter.title,
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
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                let dom = this.createDOM( data.data.html );
                let pageLinks = [...dom.querySelectorAll( 'source.art-image' )].map( element => element.src );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}