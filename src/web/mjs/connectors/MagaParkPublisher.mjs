import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MagaParkPublisher extends Connector {

    constructor() {
        super();
        super.id = 'manga-park';
        super.label = 'マンガPark (Manga-Park)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://manga-park.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.titleMain div.titleInfo h1');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.list div.series ul.common-list li a div.info h3', 5 )
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
        let request = new Request( this.url + '/series', this.requestOptions );
        this.fetchDOM( request, 'div.list div.series ul.days li a' )
            .then( data => {
                let pageLinks = data.map( page => this.getAbsolutePath( page, request.url ) );
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
        this.fetchDOM( request, 'div.chapter ul li div.badge source[src$="mangadetail_badge-free.svg"]' )
            .then( data => {
                let chapterList = data.map( element => {
                    let id = element.closest( 'li' );
                    let num = id.querySelector( 'div.chapterNumber span' ).innerText.trim();
                    let title = id.querySelector( 'div.chapterNumber p.chapterTitle' ).innerText.trim();
                    return {
                        id: id.dataset.chapterId,
                        title: ( num + ' - ' + title ).trim(),
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
        let request = new Request( this.url + '/api/chapter/' + chapter.id, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.data.chapter.reduce( ( accumulator, element ) => {
                    let images = element.images.map( image => this.createConnectorURI( {
                        url: this.getAbsolutePath( image.path, request.url ),
                        key: image.key
                    } ) );
                    return accumulator.concat( images );
                }, [] );
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
        let request = new Request( payload.url, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return fetch( request )
            .then( response => {
                return response.arrayBuffer()
                    .then( data => {
                        return Promise.resolve( {
                            mimeType: response.headers.get( 'content-type' ),
                            data: this._decryptImage( data, this._decodeKey( payload.key ) )
                        } );
                    } );
            } )
            .then( data => {
                this._applyRealMime( data );
                return Promise.resolve( data );
            } );
    }

    /**
     *
     */
    _decryptImage( encrypted, key ) {
        // create a view for the buffer
        let decrypted = new Uint8Array( encrypted );
        for( let index in decrypted ) {
            decrypted[index] ^= key[index % key.length];
        }
        return decrypted;
    }

    /**
     *
     */
    _decodeKey( key ) {
        return atob( key ).split( '' ).map( s => s.charCodeAt( 0 ) );
    }
}