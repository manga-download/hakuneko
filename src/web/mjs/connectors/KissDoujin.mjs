import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class KissDoujin extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kissdoujin';
        super.label = 'KissDoujin';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://kissdoujin.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions );
        this.fetchJSON( request )
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
        this.fetchDOM( request, 'div.episodeList table.listing tr td:first-of-type a, div.section ul.list li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /read online/i, '' ).replace( manga.title, '' ).trim(),
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
        if( this.isLocked ) {
            console.warn( `[WARN: ${this.label}, too many requests]` );
            callback( new Error( 'Request to ' + this.label + ' has been skipped to prevent the client from beeing blocked for to many requests!' ), [] );
            return;
        }
        let key = this.lock();
        setTimeout( () => {
            this.unlock( key );
        }, this.pageLoadDelay );

        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, 'lstImages' )
            .then( data => {
                let pageList = data.map( link => new URL( link, request.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}