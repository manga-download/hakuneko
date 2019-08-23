import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class KoMBatch extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kombatch';
        super.label = 'KoMBatch';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kombatch.com';
    }

    _getMangaListFromPages( url, retries ) {
        retries = retries || 3;

        let request = new Request( url, this.requestOptions );
        return fetch( request )
            .then( response => {
                if( response.status >= 500 && retries > 0 ) {
                    return this.wait( 5000 )
                        .then( () => this._getMangaListFromPages( url, retries - 1 ) );
                }
                if( response.status === 200 ) {
                    return response.text()
                        .then( data => {
                            let dom = this.createDOM( data );

                            let mangaList = [...dom.querySelectorAll( 'a._2dU-m.vlQGQ' )].map( element => {
                                return {
                                    id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                                    title: element.text.trim()
                                };
                            } );

                            let nextPage = dom.querySelector( 'a.page-link[aria-label^="Next"]' );
                            if( nextPage )
                            {
                                nextPage = this.getAbsolutePath( nextPage, request.url );
                                return this._getMangaListFromPages( nextPage )
                                    .then( mangas => mangaList.concat( mangas ) );
                            }
                            else
                            {
                                return Promise.resolve( mangaList );
                            }
                        } );
                }
                throw new Error( `Failed to receive content from "${request.url}" (status: ${response.status}) - ${response.statusText}` );
            } );
    }

    _getMangaList( callback ) {
        this._getMangaListFromPages( this.url + '/manga-list?page=1' )
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
        this.fetchDOM( request, 'span.lchx.desktop a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim(),
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
        let request = new Request( this.url + chapter.id.replace( 'manga', 'api/chapter' ), this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.chapter.images.map( image => this.getAbsolutePath( image.text, this.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}