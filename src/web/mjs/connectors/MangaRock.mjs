import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaRock extends Connector {

    constructor() {
        super();
        super.id = 'mangarock';
        super.label = 'MangaRock';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangarock.com';
        this.apiURL = 'https://api.mangarockhd.com';
        this.requestOptions.headers.set( 'content-type', 'application/json' );
        this.requestOptions.headers.set( 'x-origin', 'https://mangarock.com' );
        this.pageLock = 0;
        this.pageLockDelay = 500;
    }

    /**
     *
     */
    _getJsonResponse( response, type ) {
        if( response.status !== 200 ) {
            throw new Error( `Failed to receive ${type} list (status: ${response.status}) - ${response.statusText}` );
        }
        return response.json()
            .then( data => {
                if( data.code !== 0 ) {
                    throw new Error( this.label + ' error: ' + data.code );
                }
                return Promise.resolve( data.data );
            } );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname.split('/').pop();
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = JSON.stringify( {
            genres: {},
            order: 'name',
            rank: 'all',
            status: 'all'
        } );
        fetch( this.apiURL + '/query/web401/mrs_filter?country=', this.requestOptions )
            .then( response => {
                return this._getJsonResponse( response, 'manga' );
            } )
            .then( data => {
                if( data.includes( '' ) ) {
                    throw new Error( 'The manga list provided by the server contains one or more empty entries!' );
                }
                // NOTE: mangarock limits the amount of manga requests => split into 5k queries
                let promises = [];
                while( data.length > 0 ) {
                    this.requestOptions.body = JSON.stringify( data.splice( 0, 5000 ) );
                    promises.push(
                        fetch( this.apiURL + '/meta', this.requestOptions )
                            .then( response => this._getJsonResponse( response, 'manga' ) )
                    );
                }
                return Promise.all( promises );
            } )
            .then( data => {
                let object2array = ( value ) => {
                    return Object.entries( value ).map( kvp => {
                        return {
                            id: kvp[1].oid,
                            title: kvp[1].name
                        };
                    } );
                };
                let mangaList = data.reduce( ( accumulator, value ) => accumulator.concat( object2array( value ) ), [] );
                callback( null, mangaList );
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
        this.requestOptions.method = 'GET';
        this.requestOptions.body = undefined;
        let request = new Request( this.url + '/manga/' + manga.id, this.requestOptions );
        this.fetchDOM( request, 'tbody[data-test="chapter-table"] tr td:first-of-type a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: element.href.split( '/' ).pop(),
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
        this.requestOptions.method = 'GET';
        this.requestOptions.body = undefined;
        fetch( this.apiURL + '/query/web401/pagesv2?country=&oid=' + chapter.id, this.requestOptions )
            .then( response => this._getJsonResponse( response, 'page' ) )
            .then( data => {
                let pageList = data.map( page => this.createConnectorURI( page.url ) );
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
        this.requestOptions.method = 'GET';
        this.requestOptions.body = undefined;
        return fetch( payload, this.requestOptions )
            .then( response => {
                return response.arrayBuffer()
                    .then( data => {
                        data = new Uint8Array( data );
                        if( data[0] === 69 ) {
                            return this._decryptImage( data, 0x65, 'image/webp' );
                        } else {
                            return Promise.resolve( {
                                mimeType: response.headers.get( 'content-type' ),
                                data: data
                            } );
                        }
                    } );
            } );
    }

    /**
     *
     */
    _decryptImage( encrypted, key, mime ) {
        return new Promise( resolve => {
            let decrypted = new Uint8Array( encrypted.length + 15 );
            let n = encrypted.length + 7;
            let header = Uint8Array.of( 82, 73, 70, 70, n & 255, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255, 87, 69, 66, 80, 86, 80, 56 );
            let data = encrypted.map( byte => {
                return key ^ byte ;
            } );
            decrypted.set( header, 0 );
            decrypted.set( data, header.length );
            resolve( {
                mimeType: mime,
                data: decrypted
            } );
        } );
    }
}