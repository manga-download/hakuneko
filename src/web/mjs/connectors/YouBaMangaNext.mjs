import Connector from '../engine/Connector.mjs';

// Wordpress Theme: NewsMax
export default class YouBaMangaNext extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'youbamanganext';
        super.label = 'YouBa Manga (2019)';
        this.tags = [ 'webtoon', 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://youbamanga.net';
        this.apiURL = 'https://youbamanga.net/wp-json/wp/v2';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;

        this.excludes = [ 'manhua', 'martial art' ];
    }

    /**
     *
     */
    _getMangaList( callback ) {
        // NOTE: per_page is capped at 100
        this.fetchJSON( this.apiURL + '/tags?per_page=100' )
            .then( data => {
                let mangaList = data
                    .filter( tag => tag.count > 0 && !this.excludes.includes( tag.name ) )
                    .map( tag => {
                        return {
                            id: tag.id,
                            title: tag.name
                        };
                    } );
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
    _getChapterListFromPages( manga, page ) {
        page = page || 1;
        // NOTE: per_page is capped at 100
        return fetch( `${ this.apiURL }/posts?per_page=100&tags=${ manga.id }&page=${ page }`, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( Array.isArray( data ) ) {
                    let chapterList = data.map( post => {
                        return {
                            id: this.getRootRelativeOrAbsoluteLink( post.link, this.url ), // post.slug
                            title: post.title.rendered.replace( manga.title, '' ).trim(),
                            language: ''
                        };
                    } );
                    return this._getChapterListFromPages( manga, page + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( [] );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        this._getChapterListFromPages( manga )
            .then( data => {
                callback( null, data );
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
        this.fetchDOM( this.url + chapter.id, 'div.entry div.separator source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, this.url + chapter.id ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}