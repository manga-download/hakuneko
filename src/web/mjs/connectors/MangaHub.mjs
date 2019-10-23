import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHub extends Connector {

    constructor() {
        super();
        super.id = 'mangahub';
        super.label = 'MangaHub';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangahub.io';
        this.apiURL = 'https://api2.mangahub.io/graphql';
        this.cdnURL = 'https://cdn.mangahub.io/file/imghub/';

        this.path = 'm01';
    }

    /**
     *
     */
    _getJsonResponse( payload ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = JSON.stringify( payload );
        this.requestOptions.headers.set( 'content-type', 'application/json' );
        let promise = fetch( this.apiURL, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( data[ 'errors' ] ) {
                    throw new Error( this.label + ' errors: ' + data.errors.map( error => error.message ).join( '\n' ) );
                }
                if( !data[ 'data' ] ) {
                    throw new Error( this.label + 'No data available!' );
                }
                return Promise.resolve( data.data );
            } );
        this.requestOptions.headers.delete( 'content-type' );
        delete this.requestOptions.body;
        this.requestOptions.method = 'GET';
        return promise;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#mangadetail div.container-fluid div.row h1');
        let id = uri.pathname.split('/').pop();
        let title = data[0].firstChild.textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( offset ) {
        offset = offset || 0;
        let payload = {
            query: `{
                    search( x:${this.path}, q:"", genre:"all", mod:ALPHABET, count:true, offset:${offset} )
                    {
                        rows {
                            id, title, slug
                        }
                    }
                }`
        };
        return this._getJsonResponse( payload )
            .then( data => {
                let mangaList = data.search.rows.map( manga => {
                    return {
                        id: manga.slug, // manga.id
                        title: manga.title
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( offset + 30 )
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
    _getChapterList( manga, callback ) {
        let payload = {
            query: `{
                    manga( x:${this.path}, slug:"${manga.id}" ) {
                        chapters {
                            id, number, title, slug
                        }
                    }
                }`
        };
        this._getJsonResponse( payload )
            .then( data => {
                let chapterList = data.manga.chapters.map( chapter => {
                    // .padStart( 4, '0' )
                    let title = `Ch. ${chapter.number} - ${chapter.title}`;
                    return {
                        id: chapter.number, // chapter.id, chapter.slug,
                        title: title.trim(),
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
        let payload = {
            query: `{
                    chapter( x:${this.path}, slug:"${manga.id}", number:${chapter.id}) {
                        pages
                    }
                }`
        };
        this._getJsonResponse( payload )
            .then( data => {
                let pageList = Object.values( JSON.parse( data.chapter.pages ) ).map( page => this.cdnURL + page );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}