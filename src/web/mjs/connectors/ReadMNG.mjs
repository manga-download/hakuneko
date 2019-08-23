import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ReadMNG extends Connector {

    /**
     * Very similar to mangadoom
     */
    constructor() {
        super();
        super.id = 'readmng';
        super.label = 'ReadMangaToday';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.readmng.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        Promise.resolve( '#abcdefghijklmnopqrstuvwxyz'.split( '' ) )
            .then( pages => {
                let promises = pages.map( page => {
                    let request = new Request( this.url + '/manga-list/' + page, this.requestOptions );
                    return this.fetchDOM( request, 'div.manga-list-box span.manga-item a' )
                        .then( data => {
                            let mangaList = data.map( element => {
                                this.cfMailDecrypt( element );
                                return {
                                    id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                                    title: element.text.trim()
                                };
                            } );
                            return Promise.resolve( mangaList );
                        } );
                } );
                return Promise.all( promises );
            } )
            .then( mangas => {
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'ul.chp_lst li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    let title = element.querySelector( 'span.val' ).textContent.trim();
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: title.replace( manga.title, '' ).replace( /^\s*-\s*/, '' ).trim(),
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
        let request = new Request( this.url + chapter.id + '/all-pages', this.requestOptions );
        this.fetchDOM( request, 'div.page_chapter source' )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( this.getAbsolutePath( element, request.url ) ) );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}