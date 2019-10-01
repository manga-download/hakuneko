import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Team1x1 extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'team1x1';
        super.label = 'Team X';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://team1x1.com';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div#page-manga div.container div.last-post-manga div.thumb div.info h3 a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
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
        let request = new Request( this.url + '/manga/', this.requestOptions );
        this.fetchDOM( request, 'div.pagination div.wp-pagenavi > a.page:last-of-type' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div.single-manga-chapter div.container div.row div.col-md-12 a' )
            .then( data => {
                let chapterList = data
                    .filter( element => element.href.startsWith( this.url ) )
                    .map( element => {
                        return {
                            id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                            title: element.text.replace( manga.title, '' ).trim(),
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
        let script = `new Promise( resolve => resolve( PushManga.pages.original.map( p => p.page + '?token=' + p.token ) ) );`;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}