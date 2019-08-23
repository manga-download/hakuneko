import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaDoom extends Connector {

    /**
     * Very similar to readmng
     */
    constructor() {
        super();
        super.id = 'mangadoom';
        super.label = 'MangaDoom';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.mngdoom.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.content ul.manga-list li a.manga-info-qtip', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        Promise.resolve( [ '' ].concat( 'abcdefghijklmnopqrstuvwxyz'.split( '' ) ) )
            .then( data => {
                let pageLinks = data.map( page => this.url + '/manga-directory/' + page );
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
        this.fetchDOM( request, 'div#chapter_list ul.chapter-list li a span.val' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.closest( 'a' ), request.url ),
                        title: element.innerText.replace( manga.title, '' ).replace( /\s*-/, '' ).trim(),
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
        let request = new Request( this.url + chapter.id + '/all-pages', this.requestOptions );
        this.fetchDOM( request, 'div.inner-page source.img-responsive' )
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