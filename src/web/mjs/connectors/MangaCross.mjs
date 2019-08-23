import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaCross extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangacross';
        super.label = 'MangaCross';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://mangacross.jp';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/api/comics.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let mangaList = data.comics.map( element => {
                    return {
                        id: element.dir_name,
                        title: element.title.trim()
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
        let request = new Request( this.url + '/api/comics/' + manga.id + '/1.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                // Is there a way to access the "private" chapters ? Logging in didn't change anything...
                let chapterList = data.comic.episodes.filter( element => element.status == 'public' ).map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.page_url, request.url ),
                        title: element.volume.trim(),
                        language: 'jp'
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
        let request = new Request( this.url + chapter.id + '/viewer.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.episode_pages.map( element => this.getAbsolutePath( element.image.pc_url, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}