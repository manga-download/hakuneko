import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ReadComicBooksOnline extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readcomicbooksonline';
        super.label = 'ComicPunch';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://comicpunch.net';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/comics-list', this.requestOptions );
        this.fetchDOM( request, 'div#block-system-main div.view-content table tbody tr td a' )
            .then( data => {
                let mangaList = data.map( element => {
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
        this.fetchDOM( this.url + manga.id, 'div#chapterlist li.chapter a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ) + '/?q=fullchapter',
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
                    };
                } ).filter( chapter => chapter.title !== '' );
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
        this.fetchDOM( request, 'source.picture' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( {
                    url: this.getAbsolutePath( '/reader/' + element.getAttribute( 'src' ), request.url ),
                    referer: request.url
                } ) );
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
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set( 'x-referer', payload.referer );
        let promise = super._handleConnectorURI( payload.url );
        this.requestOptions.headers.delete( 'x-referer' );
        return promise;
    }
}