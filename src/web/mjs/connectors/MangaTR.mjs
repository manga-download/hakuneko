import Connector from '../engine/Connector.mjs';

/**
 * Seems to be customized FlatManga CMS
 */
export default class MangaTR extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangatr';
        super.label = 'Manga-TR';
        this.tags = [ 'manga', 'turkish' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://manga-tr.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
        this.requestOptions.headers.set( 'x-cookie', 'read_type=1' );
        this.requestOptions.headers.set( 'x-requested-with', 'XMLHttpRequest' );
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/manga-list.html?listType=allABC', 'span[data-toggle="mangapop"] a' )
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
    _getChapterListFromPages( manga, link, pages, page ) {
        page = page || 1;
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.body = 'page=' + page;
        let promise = this.fetchDOM( link, 'table.table tr td.table-bordered:first-of-type > a', 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                if( page < pages ) {
                    return this._getChapterListFromPages( manga, link, pages, page + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
        this.requestOptions.method = 'GET';
        this.requestOptions.headers.delete( 'content-type' );
        this.requestOptions.body = undefined;
        return promise;
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let uri;
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let link = data.match( /"([^"]*cek\/fetch_pages_manga.php\?manga_cek=[^"]*)"/ )[1];
                uri = new URL( link, this.url );
                let promise = this.fetchDOM( uri.href, 'ul.pagination1 li:last-of-type a' );
                return promise;
            } )
            .then( data => {
                let pageCount = parseInt( data.length ? data[0].dataset.page : 1 );
                return this._getChapterListFromPages( manga, uri.href, pageCount );
            } )
            .then( data => {
                callback( null, data );
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
        this.fetchDOM( this.url + chapter.id, 'source.chapter-img' )
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