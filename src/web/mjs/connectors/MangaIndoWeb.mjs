import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaIndoWeb extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaindoweb';
        super.label = 'MangaIndoWeb';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangaindo.web.id';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/manga-list-201902-v052/', this.requestOptions );
        this.fetchDOM( request, 'div#az-slider div.letter-section ul li.manga-list a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
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
        this.fetchDOM( request, 'ul.lcp_catlist li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).replace( '–', '' ).trim(),
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.entry-content p source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}