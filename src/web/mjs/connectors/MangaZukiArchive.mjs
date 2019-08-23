import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaZukiArchive extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki-archive';
        super.label = 'Mangazuki Archive';
        this.tags = [ 'webtoon', 'high-quality', 'multi-lingual', 'scanlation' ];
        this.url = 'https://beta.mangazuki.co';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( this.url + mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div#root div.container table.table tbody tr td:nth-of-type(2) a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim() + ( request.url.includes( '/raw' ) ? ' (RAW)' : '' )
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
        this._getMangaListFromPages( [ '/series/list', '/raws/list' ] )
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
        this.fetchDOM( request, 'div#root div.column table.table tbody tr td:nth-of-type(2) a' )
            .then( data => {
                let chapterList = data.map( element => {
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
        let script = `
                new Promise( resolve => {
                    let makeLink = property => {
                        let path = '/file/' + __APOLLO_STATE__[property]._id;
                        return new URL( path, location.origin ).href;
                    };
                    let result = Object.keys( __APOLLO_STATE__ );
                    result = result.filter( property => property.startsWith( 'File:' ) );
                    result = result.map( property => makeLink( property ) );
                    resolve( result );
                } );
            `;
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