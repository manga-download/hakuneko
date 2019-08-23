import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class YouBaManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'youbamanga';
        super.label = 'YouBa Manga';
        this.tags = [ 'webtoon', 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://www.youbamangablog.ga';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url, 'div#Sidebar div#Label1 ul li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
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
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( chapterPageLinks[ index ], 'div#Blog div.items div.card div.card__data h2 a', 5 ) )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
                    };
                } );
                if( index < chapterPageLinks.length - 1 ) {
                    return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOption );
        let script = `
                [...document.querySelectorAll( 'div#Blog div#blog-pager a:not([rel="next"])' )]
                .map( element => element.href )
            `;
        Engine.Request.fetchUI( request, script )
            .then( pageLinks => {
                return this._getChapterListFromPages( manga, pageLinks );
            } )
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
        let query = 'div.main-content div.blog article div.post-body source';
        this.fetchDOM( this.url + chapter.id, query )
            .then( data => {
                let sponsorLink = data.find( img => img.getAttribute( 'alt' ) && img.parentElement.nodeName === 'A' );
                if( sponsorLink ) {
                    return this.fetchDOM( data.pop().parentElement.href, query );
                } else {
                    return Promise.resolve( data );
                }
            } )
            .then( data => {
                let pageList = data.map( element => element.src );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}