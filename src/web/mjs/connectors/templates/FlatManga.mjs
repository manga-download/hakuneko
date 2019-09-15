import Connector from '../../engine/Connector.mjs';

export default class FlatManga extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.queryChapters = 'div#tab-chapper table tr td a.chapter';
        this.language = 'jp';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/manga-list.html?listType=allABC', 'span[data-toggle="mangapop"] a' )
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
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let language = dom.querySelector( 'ul.manga-info h1 span.flag-icon' );
                language = language ? language.className.match( /flag-icon-([a-zA-Z]+)/ )[1] : this.language ;
                let chapterList = [...dom.querySelectorAll( this.queryChapters )].map( element => {
                    let title = element.text.replace( manga.title, '' );
                    let mangaTitle = manga.title.replace( /\s*-\s*RAW$/, '' );
                    title = title.replace( mangaTitle.toUpperCase(), '' );
                    title = title.replace( mangaTitle, '' );
                    title = title.replace( /^\s*-\s*/, '' );
                    title = title.replace( /-\s*-\s*Read\s*Online\s*$/, '' );
                    title = title.trim();
                    return {
                        id: this.getRelativeLink( element ),
                        title: title,
                        language: language
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'source.chapter-img' )
            .then( data => {
                let pageLinks = data
                    .map( element => this.createConnectorURI( this.getAbsolutePath( element.dataset.src || element, request.url ) ) )
                    .filter( page => !page.match( /3282f6a4b7_o/ ) );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}