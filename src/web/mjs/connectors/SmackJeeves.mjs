import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class SmackJeeves extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'smackjeeves';
        super.label = 'Smack Jeeves';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'http://www.smackjeeves.com';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( mangaPageLinks[ index ], 'div.comic-container a.card', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.querySelector( 'div.title' ).textContent.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let path = '/search.php?last_update=6&sort_by=4';
        this.fetchDOM( this.url + path, 'div.comic-nav div#browse-page-select select option' )
            .then( data => {
                let pageLinks = data.map( option => this.url + path + '&start=' + option.value );
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
        let comicURL;
        this.fetchDOM( this.url + manga.id, 'div.middle div.title div.buttons a.button:last-of-type' )
            .then( data => {
                comicURL = data[0].href;
                this.requestOptions.headers.set( 'x-cookie', '_sj_view_m=' + Math.floor( Date.now() / 1000 ) );
                return this.fetchDOM( comicURL, 'select.jumpbox' );
            } )
            .then( data => {
                if( !data.length ) {
                    throw new Error( 'Page template not supported, no chapter/page selection box found!' );
                }
                let chapterList = [...data[0].querySelectorAll( '.jumpbox_chapter' )];
                if( !chapterList.length ) {
                    chapterList = [
                        {
                            id: comicURL,
                            title: manga.title,
                            language: 'en'
                        }
                    ];
                } else {
                    chapterList = chapterList.map( element => {
                        return {
                            id:  new URL( element.value || comicURL, comicURL ).href,
                            title: element.label.trim() || element.textContent.trim(),
                            language: 'en'
                        };
                    } );

                }
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
        let request = new Request( chapter.id, this.requestOptions );
        this.fetchDOM( request, 'select.jumpbox option.jumpbox_page' )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.value, request.url ) ) );
                callback( null, pageLinks );
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
        return this.fetchDOM( request, 'source#comic_image' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
    }
}