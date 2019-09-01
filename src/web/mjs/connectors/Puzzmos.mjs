import Connector from '../engine/Connector.mjs';

/**
 * Seems to be customized FlatManga CMS
 * Very similar to EpikManga
 */
export default class Puzzmos extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'puzzmos';
        super.label = 'Puzzmos';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://puzzmos.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/directory?type=text', 'span[data-toggle="mangapop"] a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url ),
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'table#bolumler tr td:first-of-type a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
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
        this.requestOptions.method = 'POST';
        this.requestOptions.body = 'altalta=';
        let request = new Request( this.url + chapter.id, this.requestOptions );
        request.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.method = 'GET';
        delete this.requestOptions.body;
        this.fetchDOM( request, 'div.chapter-content source.chapter-img2' )
            .then( data => {
                let pageLinks = data.map( element => {
                    let uri = new URL( this.getRelativeLink( element ), this.url );
                    return uri.href;
                } );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}