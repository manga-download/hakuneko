import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaChan extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangachan';
        super.label = 'Манга-тян (Manga-chan)';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://manga-chan.me';

        this.path = '/catalog';
        this.queryMangas = 'div#content div.content_row div.manga_row1 h2 a.title_link';
        this.queryChapters = 'table.table_cha tr td div.manga2 a';
        this.queryPages = /['"]fullimg['"]\s*:\s*\[\s*(".*?")\s*,?\s*\]/;
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, this.queryMangas, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.trim() // element.text.trim()
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
        let request = new Request( this.url + this.path, this.requestOptions );
        this.fetchDOM( request, 'div#pagination span a:last-of-type' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + '?offset=' + page * 20 );
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
        this.fetchDOM( request, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim().replace( 'Читать онлайн', manga.title ),
                        language: 'ru'
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
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                let pageList = JSON.parse( '[' + data.match( this.queryPages )[1] + ']' )
                // temporary fix image CDN for old domain which are no longer available
                    .map( link => link.replace( /img\d+\.manga-chan\.me/, 'manga-chan.me' ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}