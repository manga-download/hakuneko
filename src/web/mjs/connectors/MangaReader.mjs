import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 */
export default class MangaReader extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangareader';
        super.label = 'MangaReader';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangareader.net';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        fetch( this.url + '/alphabetical', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let mangaList = [...dom.querySelectorAll( 'ul.series_alpha li a' )].map( element => {
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
                let chapterList = [...dom.querySelectorAll( '#listing tbody tr td a' )].map( element => {
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
        this.fetchDOM( request, '#pageMenu option' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.value, request.url ) ) );
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
        return this.fetchDOM( request, '#imgholder #img' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ).replace( '//i1.', '//i2.' ) ) );
    }
}