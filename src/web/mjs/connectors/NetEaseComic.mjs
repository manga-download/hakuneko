import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class NetEaseComic extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '网易漫画 (NetEase Comic)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'https://163.bilibili.com';
        this.token = '1dc94fcc556a17276b9882341fa9b6df'; // <input id="j-csrf" type="hidden" value="1dc94fcc556a17276b9882341fa9b6df" />
    }

    /**
     *
     */
    _getMangaListFromPages( uri, page ) {
        page = page || 1;
        uri.searchParams.set( 'page', page );
        uri.searchParams.set( '_', Date.now() );
        return this.fetchJSON( uri.href, 5 )
            .then( data => {
                let mangaList = data.books
                    .filter( (/*book*/) => {
                        /*
                         * book.payType: 0
                         * book.payTypeEnum: "FREE"
                         * book.publishTime: "1430996543248"
                         */
                        return true;
                    } )
                    .map( book => {
                        return {
                            id: book.bookId,
                            title: book.title
                        };
                    } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( uri, page + 1 )
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
        let uri = new URL( '/category/getData.json', this.url );
        uri.searchParams.set( 'sort', 1 );
        uri.searchParams.set( 'pageSize', 250 );
        uri.searchParams.set( 'csrfToken', this.token );
        this.fetchJSON( uri.href )
            .then( data => {
                let pageSize = data.pageQuery.pageSize;
                //let pageCount = data.pageQuery.pageCount;
                uri.searchParams.set( 'pageSize', pageSize );
                return this._getMangaListFromPages( uri, 1 );
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
        this.fetchJSON( `${ this.url }/book/catalog/${ manga.id }.json?_c=${ Date.now() }` )
            .then( data => {
                // NOTE: sections are nested, top level section seems to be a single fake container
                let chapterList = data.catalog.sections[0].sections
                    .filter( section => {
                        return section.price === 0 || section.needPay === 0 ;
                    } )
                    .map( section => {
                        return {
                            id: section.sectionId,
                            title: section.title || section.fullTitle,
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
        let request = new Request( [ this.url, 'reader', manga.id, chapter.id ].join( '/' ), this.requestOptions );
        Engine.Request.fetchUI( request, `window.PG_CONFIG.images` )
            .then( data => {
                let pageList = data.map( page => page.url );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}