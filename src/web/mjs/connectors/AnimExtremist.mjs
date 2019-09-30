import Connector from '../engine/Connector.mjs';

export default class AnimExtremist extends Connector {

    constructor() {
        super();
        super.id = 'animextremist';
        super.label = 'AnimeXtremist';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'http://www.animextremist.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        // ['/mangas.htm?ord=completados', '/mangas.htm?ord=todos']
        this.fetchDOM( this.url + '/mangas.htm?ord=todos', 'div#mangas div#manga a' )
            .then( data => {
                let mangaList = data.map( element => {
                //this.cfMailDecrypt( element );
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
        this.fetchDOM( this.url + manga.id, 'div#tomos div#tomo a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ).replace( this.url.replace( 'www.', '' ), '' ).replace( '.html', '-1.html' ),
                        title: element.text.trim(),
                        language: 'spanish'
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
        this.fetchDOM( this.url + chapter.id, 'div#nav select#nav-jump option' )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( this.url + '/' + element.value ) );
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
        return this.fetchDOM( request, 'source#photo' )
            .then( data => {
                let link = this.getRootRelativeOrAbsoluteLink( data[0], request.url ).replace( /^\//, '' );
                link = new URL( link, request.url ).href;
                return fetch( link, this.requestOptions );
            } )
            .then( response => response.blob() )
            .then( data => this._blobToBuffer( data ) )
            .then( data => {
                this._applyRealMime( data );
                return Promise.resolve( data );
            } );
    }
}