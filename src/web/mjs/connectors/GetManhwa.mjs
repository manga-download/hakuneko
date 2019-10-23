import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GetManhwa extends Connector {

    constructor() {
        super();
        super.id = 'getmanhwa';
        super.label = 'GetManhwa';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.getmanhwa.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content div.elementor-widget-wrap div.elementor-widget-container > h2.elementor-heading-title');
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
        return fetch( request )
            .then( response => response.text() )
            .then( data => {
                data = [...this.createDOM( data, false )
                    .querySelectorAll( 'div#content div.elementor-widget-container > div.elementor-image > a[data-elementor-open-lightbox]' )];
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.querySelector('img').alt.replace( '2018_05_23_15270545846574_result', 'her time' ).trim()
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
        let pageLinks = [ 'romance', 'drama', 'comedy', 'fantasy', 'action', 'bl', 'gl', 'horror', 'school-life', 'scifi' ].map( genre => this.url + '/genre-' + genre + '/' );
        this._getMangaListFromPages( pageLinks )
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
        this.fetchDOM( request, 'section.elementor-section-boxed div.make-column-clickable-elementor h2.elementor-heading-title' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        // chapter links may still point to the old domain 'https://getmanhwa.co'
                        id: this.getAbsolutePath( element.closest( 'div.make-column-clickable-elementor' ).dataset.columnClickable, request.url ),
                        title: element.innerText.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } )
                    .filter( chapter => chapter.title.toLowerCase() !== 'start reading' );
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
        let uri = new URL( chapter.id, this.url );
        let request = new Request( uri.href, this.requestOptions );
        this.fetchDOM( request, 'div.reading-content div.page-break source.wp-manga-chapter-img' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}