import Connector from '../../engine/Connector.mjs';

export default class WordPressLightPro extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/manga-list/all/any/name-az/';

        this.queryMangasPageCount = 'div.wpm_nav ul.pgg li:last-of-type a';
        this.queryMangas = 'div.mng_lst div.nde div.det a.mng_det_pop';
        this.queryChaptersPageCount = 'div.mng_det ul.pgg li:last-of-type a';
        this.queryChapters = 'div.mng_det ul.lst li a.lst b.val';
        this.queryPageLinks = 'div.wpm_pag div.wpm_nav:first-of-type ul.nav_pag li select.cbo_wpm_pag option';
        this.queryPages = 'div.wpm_pag div.prw a source';
        this.language = '';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( mangaPageLinks[ index ], this.queryMangas, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.title.trim() || element.text.trim()
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
        this.fetchDOM( this.url + this.path, this.queryMangasPageCount )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /(\d+)\/$/ )[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + this.path + ( page + 1 ) + '/' );
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
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( chapterPageLinks[ index ], this.queryChapters, 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    let anchor = element.nodeName.toLowerCase() === 'a' ? element : element.closest( 'a' );
                    return {
                        id: this.getRelativeLink( anchor ),
                        title: element.innerText.replace( manga.title, '' ).trim(),
                        language: this.language
                    };
                } );
                if( index < chapterPageLinks.length - 1 ) {
                    return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
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
        this.fetchDOM( this.url + manga.id, this.queryChaptersPageCount )
            .then( data => {
                let pageCount = data.length === 0 ? 1 : parseInt( data[0].href.match( /(\d+)\/$/ )[1] ) ;
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + manga.id + 'chapters-list/' + ( page + 1 ) + '/' );
                pageLinks[0] = this.url + manga.id;
                return this._getChapterListFromPages( manga, pageLinks );
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
        this.fetchDOM( this.url + chapter.id, this.queryPageLinks )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.url + chapter.id + element.value + '/' ) );
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
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return this.fetchDOM( request, this.queryPages )
            .then( data => {
                let span = document.createElement( 'span' );
                span.innerHTML = data[0].getAttribute( 'src' );
                return fetch( new URL( span.textContent.trim(), request.url ).href, this.requestOptions );
            } )
            .then( response => response.blob() )
            .then( data => this._blobToBuffer( data ) );
    }
}