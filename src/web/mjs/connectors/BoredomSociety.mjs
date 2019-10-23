import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class BoredomSociety extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'boredomsociety';
        super.label = 'BoredomSociety';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://www.boredomsociety.xyz';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    async _initializeConnector() {
        return super._initializeConnector()
            .then( () => {
                /*
                 *let form = new URLSearchParams();
                 *form.append( 'readingtype', 'all' );
                 *form = form.toString();
                 */
                this.requestOptions.method = 'POST';
                this.requestOptions.body = 'readingtype=all'; //form;
                this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );

                let promise = fetch( this.url + '/module/reader/ajax.php', this.requestOptions );

                this.requestOptions.headers.delete( 'content-type' );
                delete this.requestOptions.body;
                this.requestOptions.method = 'GET';

                return promise;
            } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( mangaPageLinks[ index ], 'div.titlelist_frame div.titlelist_frameinfo div.titlelist_name a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
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
        this.fetchDOM( this.url + '/titles/page/', 'div.titles_pages a:nth-last-of-type(2)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/titles/page/' + ( page + 1 ) );
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
        this.fetchDOM( this.url + manga.id, 'div.titlesinfo_chapters table.titlesinfo_chaptertable tr:not(:first-of-type)' )
            .then( data => {
                let chapterList = data.map( element => {
                    let cells = [...element.querySelectorAll( 'td' )];
                    let volume = cells[0].innerText.trim() || '#';
                    let chapter = cells[1].innerText.trim() || '#';
                    let title = cells[2].innerText.trim();
                    element = cells[2].querySelector( 'a' );
                    return {
                        id: this.getRelativeLink( element ),
                        title: `Vol.${volume} Ch.${chapter} - ${title}`.replace( manga.title, '' ).trim(),
                        language: 'en'
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
        this.fetchDOM( this.url + chapter.id, 'div.reader_mangaimagebox source.reader_mangaimage' )
            .then( data => {
                let pageList = data.map( element => new URL( this.getRelativeLink( element ), this.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}