import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaTube extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangatube';
        super.label = 'MangaTube';
        this.tags = [ 'manga', 'german' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://manga-tube.me';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        fetch( this.url + '/ajax', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( () => Promise.resolve( 75 ) )
            .then( pageCount => {
                this.requestOptions.method = 'POST';
                this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
                let params = new URLSearchParams();
                params.append( 'action', 'load_series_list_entries' );
                let promises = [... new Array( pageCount ).keys()].map( page => {
                    return this.wait( 50 * page )
                        .then( () => {
                            params.set( 'parameter[page]', page + 1 );
                            this.requestOptions.body = params.toString();
                            return fetch( this.url + '/ajax', this.requestOptions );
                        } )
                        .then( response => {
                            if( response.status !== 200 ) {
                                throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                            }
                            return response.json();
                        } )
                        .then( data => {
                            let mangaList = data.success.map( entry => {
                                return {
                                    id: entry.manga_slug,//entry.manga_id,
                                    title: entry.manga_title
                                };
                            } );
                            return Promise.resolve( mangaList );
                        } );
                } );
                return Promise.all( promises );
            } )
            .then( mangas => {
                this.requestOptions.method = 'GET';
                this.requestOptions.headers.delete( 'content-type' );
                this.requestOptions.body = undefined;
                callback( null, [].concat( ... mangas ) );
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
        this.fetchDOM( this.url + '/series/' + manga.id, 'div#chapter div.vol-container' )
            .then( data => {
                let chapterList = [];
                data.forEach( card => {
                    let volume = card.querySelector( 'a.btn' ).text.trim();
                    let chapters = [...card.querySelectorAll( 'ul.chapter-list li > a:nth-of-type(2)' )].map( element => {
                        let number = element.querySelector( 'b' );
                        number = number ? number.textContent.trim() : '' ;
                        let description = element.querySelector( 'span.chapter-name' );
                        description = description ? description.textContent.trim() : '' ;
                        let title = volume;
                        title += ( title && number ? ' ' : '' ) + number;
                        title += ( title && description ? ' - ' : '' ) + description;
                        return {
                            id: this.getRelativeLink( element ),
                            title: title.trim(),
                            language: 'de'
                        };
                    } );
                    chapterList = chapterList.concat( chapters );
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
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let base = data.match( /img_path\s*:\s*'(.*?)'\s*,/ )[1];
                let pages = data.match( /pages\s*:\s*(\[.*?\])\s*,/ )[1];
                let pageList = JSON.parse( pages ).map( p => base + p.file_name );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}