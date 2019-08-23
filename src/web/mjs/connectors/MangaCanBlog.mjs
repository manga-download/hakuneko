import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaCanBlog extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangacanblog';
        super.label = 'MangaCan Blog';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'http://www.mangacanblog.com';
    }

    /**
     * TODO: for some reason fetchUI did not return successfully
     */
    _initializeConnector() {
        return Promise.resolve();
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/daftar-komik-manga-bahasa-indonesia.html', this.requestOptions );
        this.fetchDOM( request, 'div.blix ul li a.series' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div#latestchapters table tr td a.chaptersrec' )
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.navigation div.pager div.pagers a' )
            .then( data => this.fetchDOM( this.getAbsolutePath( data[0], request.url ), 'div#manga source.picture' ) )
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