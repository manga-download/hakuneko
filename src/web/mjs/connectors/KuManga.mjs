import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KuManga extends Connector {

    constructor() {
        super();
        super.id = 'kumanga';
        super.label = 'KuManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://www.kumanga.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.title_container div.h1_container h1', 5);
        let id = uri.pathname.match(/^\/manga\/\d+/)[0];
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 1;
        let perPage = 75;
        this.requestOptions.method = 'POST';
        let request = new Request( this.url + '/backend/ajax/searchengine.php', this.requestOptions );
        request.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        let form = new URLSearchParams();
        form.append( 'contentType', 'manga' );
        form.append( 'retrieveCategories', false );
        form.append( 'retrieveAuthors', false );
        form.append( 'perPage', perPage );
        form.append( 'page', page );
        request.body = form.toString();
        // NOTE: fetch( request ) => does not post content from body
        return fetch( request.url, request )
            .then( response => response.json() )
            .then( data => {
                let mangaList = data.contents.map( entry => {
                    return {
                        id: ['/manga', entry.id/*, entry.slug*/].join( '/' ),
                        title: entry.name.trim()
                    };
                } );
                if( mangaList.length === perPage ) {
                    return this._getMangaListFromPages( page + 1 )
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
        this._getMangaListFromPages()
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
    _getChapterListFromPages( manga, page ) {
        page = page || 1;
        let request = new Request( this.url + manga.id + '/p/' + page, this.requestOptions );
        return this.fetchDOM( request, 'table.table tr td h4.title > a', 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url ).replace( '/c/', '/leer/' ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                if( chapterList.length > 0 ) {
                    return this._getChapterListFromPages( manga, page + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        this._getChapterListFromPages( manga )
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
        this.requestOptions.method = 'GET';
        let request = new Request( this.url + chapter.id, this.requestOptions );
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                let pageList = JSON.parse( data.match( /pUrl\s*=\s*(\[.*\])\s*;/ )[1] )
                    .map( page => this.createConnectorURI( this.getAbsolutePath( page.imgURL, request.url ) ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}