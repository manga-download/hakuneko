import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ReadManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readmanga';
        super.label = 'ReadManga';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'http://readmanga.me';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests.\nSlightly increase the value when getting 429 errors during manga list update.',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1500
            }
        };

        this.preferSubtitleAsMangaTitle = true;
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( this.config.throttle.value )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.tile div.desc', 5 ) )
            .then( data => {
                // TODO: use english titles instead of russian titles?
                let mangaList = data.map( element => {
                    let a = element.querySelector( 'h3 a' );
                    let h4 = element.querySelector( 'h4' );
                    return {
                        id: this.getRelativeLink( a ),
                        title:  this.preferSubtitleAsMangaTitle && h4 ? h4.title : a.title
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
        this.fetchDOM( this.url + '/list', 'span.pagination a:nth-last-child(2)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/list?offset=' + page * 70 );
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
        this.fetchDOM( this.url + manga.id, 'div#mangaBox' )
            .then( data => {
                let content = data[0];
                let mangaTitle = content.querySelector( 'h1.names span.name' ).innerText.trim();
                let chapterList = [...content.querySelectorAll( 'div.chapters-link table tr td a' ) ];
                chapterList = chapterList.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /\s{1,}/g, ' ' ).replace( mangaTitle, '' ).trim(),
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
        fetch( this.url + chapter.id + '?mtr=1', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let pages = data.match( /init\s*\(\s*(\[\[.*?\]\])/ )[1];
                let pageList = JSON.parse( pages.replace( /'/g, '"' ) ).map( p => p[1] + p[2] );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}