import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PornComix extends Connector {

    constructor() {
        super();
        super.id = 'porncomix';
        super.label = 'PornComix';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://bestporncomix.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may ban your IP for to many consecutive requests.',
                input: 'numeric',
                min: 250,
                max: 5000,
                value: 500
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main div.content div.posts h2.post-title', 3);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.main div.content div.posts div.post > a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this.wait( this.config.throttle.value )
                        .then(() => this._getMangaListFromPages( mangaPageLinks, index + 1 ))
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
        this.fetchDOM( request, 'div.main div.content div.posts div.paginator a:last-of-type' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /(\d+)\/?$/ )[1].trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + 'page/' + ( page + 1 ) + '/' );
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
        this.fetchDOM( request, 'div.posts div.single-post dl.gallery-item dt a' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element, request.url ) ) );
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
        return this.fetchDOM( request, 'div.posts div.single-post div.attachment-image source' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
    }
}