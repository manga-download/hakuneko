import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaFull extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangafull';
        super.label = 'MangaFull';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangafull.org';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.cate-manga div.media div.media-body > a:first-of-type', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.trim().replace( /\s*manga$/i, '' )
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
        let request = new Request( this.url + '/popular-manga?page=', this.requestOptions );
        this.fetchDOM( request, 'div.pagelistcate div.pagelist div.pagination ul.pagination li:nth-last-of-type(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
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
        this.fetchDOM( request, 'div.total-chapter section#examples div.chapter-list ul li.row h4' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.querySelector( 'a' ), request.url ) + '/0',
                        title: element.innerText.replace( manga.title, '' ).trim(),
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
        this.fetchDOM( request, 'div.row div.each-page source.img' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}