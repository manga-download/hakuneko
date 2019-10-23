import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WebAce extends Connector {

    constructor() {
        super();
        super.id = 'webace';
        super.label = 'webエース (web ace)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://web-ace.jp';
        this.baseURL = this.url;

        this.path = '/schedule/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#sakuhin-info div.credit h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 0;
        let request = new Request( this.baseURL + this.path + page + '/', this.requestOptions );
        return this.fetchDOM( request, 'div.row div.col div.box', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.querySelector( 'a' ), request.url ).split( 'comics' )[0],
                        title: element.querySelector( 'h3' ).textContent.replace( /\(\d+\)$/, '' ).trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 20 )
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
                // check for available online chapters: ID has 7-digits '100****' or path starts with '/youngaceup/'
                callback( null, data.filter( manga => manga.id.match( /\/100\d{4}\/?$/ ) ) );
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
        let uri = this.baseURL + manga.id + ( manga.id.endsWith( 'episode/' ) ? '' : 'episode/' );
        let request = new Request( uri, this.requestOptions );
        this.fetchDOM( request, 'div#read ul.table-view li.media a.navigate-right' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.querySelector( 'div.media-body p.text-bold' ).textContent.trim(),
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
        let uri = this.baseURL + chapter.id + ( chapter.id.endsWith( 'json/' ) ? '' : 'json/' );
        let request = new Request( uri, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.map( image => new URL( image, request.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}