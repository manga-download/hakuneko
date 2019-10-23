import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WebNovel extends Connector {

    constructor() {
        super();
        super.id = 'webnovel';
        super.label = 'Webnovel Comics';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.webnovel.com';

        this.token = '';
    }

    /**
     *
     */
    async _initializeConnector() {
        let uri = new URL( this.url );
        uri.searchParams.set( 'ts', Date.now() );
        uri.searchParams.set( 'rd', Math.random() );
        let request = new Request( uri.href, this.requestOptions );
        return Engine.Request.fetchUI( request, `new Promise( resolve => resolve( decodeURIComponent( document.cookie ).match( /_csrfToken=([^;]+);/ )[1] ) )` )
            .then( data => this.token = data );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.det-info h2');
        let id = uri.pathname.split('/').pop();
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 1;
        let uri = new URL( '/apiajax/comic/listAjax', this.url );
        uri.searchParams.set( 'pageIndex', page );
        uri.searchParams.set( '_csrfToken', this.token );
        let request = new Request( uri.href, this.requestOptions );
        return this.fetchJSON( request )
            .then( data => {
                let mangaList = data.data.comics.map( manga => {
                    return {
                        id: manga.comicId,
                        title: manga.comicName
                    };
                } );
                if( mangaList.length > 0 ) {
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
            .then( data => callback( null, data ) )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let uri = new URL( '/apiajax/comic/getChapterList', this.url );
        uri.searchParams.set( 'comicId', manga.id );
        uri.searchParams.set( '_csrfToken', this.token );
        let request = new Request( uri.href, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let chapterList = data.data.comicChapters.map( chapter => {
                    return {
                        id: chapter.chapterId,
                        title: chapter.chapterName,
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
        let uri = new URL( '/apiajax/comic/getContent', this.url );
        uri.searchParams.set( 'comicId', manga.id );
        uri.searchParams.set( 'chapterId', chapter.id );
        uri.searchParams.set( '_csrfToken', this.token );
        let request = new Request( uri.href, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.data.chapterInfo.chapterPage.map( page => this.getAbsolutePath( page.url, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}