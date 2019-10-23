import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class JapanRead extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'japanread';
        super.label = 'Japanread';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.japanread.cc';
    }

    /**
     *
     */
    async _initializeConnector() {
        let request = new Request( this.url + '/manga-list/switch-view/3', this.requestOptions );
        return Engine.Request.fetchUI( request, '' );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.container div.row a.manga_title', 5 )
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
        let request = new Request( this.url + '/manga-list', this.requestOptions );
        this.fetchDOM( request, 'nav ul.pagination li.page-item:nth-last-of-type(2) a.page-link' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + '?page=' + ( page + 1 ) );
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
        this.fetchDOM( request, 'div.chapter-container div.chapter-row div.order-lg-2 a' )
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'head meta[data-chapter-id]' )
            .then( data => this.fetchJSON( this.url + '/api/?type=chapter&id=' + data[0].dataset.chapterId ) )
            .then( data => {
                let pageList = data.page_array.map( page => this.getAbsolutePath( data.baseImagesUrl + '/' + page, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}