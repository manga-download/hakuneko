import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 *
 */
export default class HentaiFox extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hentaifox';
        super.label = 'HentaiFox';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hentaifox.com';
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    _getMangaFromURI( uri ) {
        return this.fetchDOM( uri.href, 'div.block div.info h1', 3 )
            .then( data => {
                let id = uri.pathname;
                let title = data[0].innerText.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.overview a div.caption', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.closest( 'a' ), request.url ),
                        title: element.innerText.trim()
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
        let request = new Request( this.url, this.requestOptions );
        this.fetchDOM( request, 'div.pagination > a:nth-last-of-type(2)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/pag/' + ( page + 1 ) + '/' );
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
        Promise.resolve()
            .then( () => {
                let chapterList = [ {
                    id: manga.id,
                    title: manga.title,
                    language: ''
                } ];
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
        this.fetchDOM( request, 'div.gallery div.preview_thumb a source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element.dataset['src'] || element, request.url ).replace( 't.', '.' ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

}