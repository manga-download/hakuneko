import BloggerManga from './templates/BloggerManga.mjs';

/**
 *
 */
export default class Gntai extends BloggerManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'gntai';
        super.label = 'GNTAI';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'http://www.gntai.xyz';

        this.path = '/page';
        this.feed = 'default';
        this.queryMangasPerPage = 50;
        this.queryMangasPageCount = 'div#nav-wrapper select#select-nav-pag option:last-of-type';
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        Promise.resolve()
            .then( () => {
                let chapterList = [ {
                    id: manga.id,
                    title: manga.title,
                    language: ''
                } ];
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
        Engine.Request.fetchUI( request, `pages` )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}