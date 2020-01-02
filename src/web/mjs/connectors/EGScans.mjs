import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class EGScans extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'egscans';
        super.label = 'Easy Going Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://read.egscans.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/', this.requestOptions );
        this.fetchDOM( request, 'div.pager select[name="manga"] option:not(:first-of-type)' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.value, request.url ),
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
        let request = new Request( this.url + manga.id + '/', this.requestOptions );
        this.fetchDOM( request, 'div.pager select[name="chapter"] option' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.value, request.url ),
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

    //

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id + '/', this.requestOptions );
        this.fetchRegex(request, /img_url\.push\s*\(\s*['"](.+)['"]\s*\)/g)
            .then( data => {
                let pageList = data.map(link => this.getAbsolutePath(link, this.url));
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}