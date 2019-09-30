import Connector from '../../engine/Connector.mjs';

export default class MangaReaderCMS extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = undefined;
        super.label = undefined;
        this.tags = [ 'manga' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = undefined;
        this.path = '/';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;

        this.queryMangas = 'ul.manga-list li a';
        this.queryChapters = 'ul.chapters li h5.chapter-title-rtl';
        this.queryPages = 'div#all source.img-responsive';
        this.language = '';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + this.path + 'changeMangaList?type=text', this.queryMangas )
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
    _getChapterList( manga, callback ) {
        this.fetchDOM( this.url + manga.id, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    let anchor = element.nodeName.toLowerCase() === 'a' ? element : element.querySelector( 'a' );
                    return {
                        id: this.getRelativeLink( anchor ),
                        title: element.innerText.replace( /\s*:\s*$/, '' ).replace( manga.title, '' ).trim(),
                        language: this.language
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
        this.fetchDOM( this.url + chapter.id, this.queryPages )
            .then( data => {
                let pageList = data.map( element => {
                    let src = ( element.dataset['src'] || element.src ).trim();
                    if( src.startsWith( '//' ) ) {
                        src = new URL( this.url ).protocol + src;
                    }
                    return src;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}