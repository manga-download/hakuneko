import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ActionManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'actionmanga';
        super.label = 'أكشن مانج (Action Manga)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://www.action-manga.com';
        this.requestOptions.headers.set( 'x-cookie', 'CO_VDetails=all' );
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 1;
        let request = new Request( this.url + '/list/?page=' + page, this.requestOptions );
        return this.fetchDOM( request, 'div.block-sec-list div.block-sec-item a.block-sec-title', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 1 )
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
        this._getMangaListFromPages()
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
        this.fetchDOM( request, 'div.chapterArea div.eachChapter div.text-right a.small_tags' )
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
        let request = new Request( this.url + chapter.id + '?show=all&i=1&page=1', this.requestOptions );
        this.fetchDOM( request, 'div.img_view a source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element.dataset['src'] || element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}