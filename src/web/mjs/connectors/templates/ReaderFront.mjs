import Connector from '../../engine/Connector.mjs';

export default class ReaderFront extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.baseURL = undefined;

        this.language = '';
        this.languageMap = {
            '': 0,
            'es': 1,
            'en': 2
        };
    }

    /**
     *
     */
    _getJsonResponse( payload/*, type*/ ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = JSON.stringify( payload );
        this.requestOptions.headers.set( 'content-type', 'application/json' );
        let promise = fetch( this.baseURL, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( data[ 'errors' ] ) {
                    throw new Error( this.label + ' errors: ' + data.errors.map( error => error.message ).join( '\n' ) );
                }
                if( !data[ 'data' ] ) {
                    throw new Error( this.label + 'No data available!' );
                }
                return Promise.resolve( data.data );
            } );
        this.requestOptions.headers.delete( 'content-type' );
        delete this.requestOptions.body;
        this.requestOptions.method = 'GET';
        return promise;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let payload = {
            operationName: 'Works',
            variables: {
                language: this.languageMap[this.language]
            },
            query: `query Works($language: Int) {
                        works(language: $language, orderBy: "ASC", sortBy: "stub", first: 250, offset: 0, showHidden: true) {
                            id
                            stub
                            name
                        }
                    }`
        };
        this._getJsonResponse( payload, 'mangas' )
            .then( data => {
                let mangaList = data.works.map( manga => {
                    return {
                        id: manga.stub, // manga.id
                        title: manga.name
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
        let payload = {
            operationName: 'Work',
            variables: {
                language: this.languageMap[this.language],
                stub: manga.id
            },
            query: `query Work($language: Int, $stub: String) {
                        work(language: $language, stub: $stub, showHidden: true) {
                            chapters {
                                id
                                stub
                                volume
                                chapter
                                subchapter
                                name
                                language
                            }
                        }
                    }`
        };
        this._getJsonResponse( payload, 'chapters' )
            .then( data => {
                let chapterList = data.work.chapters.map( chapter => {
                // .padStart( 4, '0' )
                    let title = `Vol. ${chapter.volume} Ch. ${chapter.chapter}.${chapter.subchapter} - ${chapter.name}`;
                    return {
                        id: chapter.id, // chapter.stub,
                        title: title.trim(),
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
        /*
         * pagesByChapter
         * chapterById
         */
        let payload = {
            operationName: 'ChapterById',
            variables: {
                id: chapter.id
            },
            query: `query ChapterById($id: Int) {
                        chapterById(id: $id, showHidden: true) {
                            uniqid
                            work {
                                uniqid
                            }
                            pages {
                                id
                                filename
                            }
                        }
                    }`
        };
        this._getJsonResponse( payload, 'pages' )
            .then( data => {
                let chapter = data.chapterById;
                let pageList = chapter.pages.map( page => {
                    let uri = new URL( ['/works', chapter.work.uniqid, chapter.uniqid, page.filename].join( '/' ), this.baseURL );
                    return uri.href;
                /*
                 *let hash = 1; // 0 ~ 2
                 * CDN: Google
                 *return `https://images${hash}-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&no_expand=1&rewriteMime=image/*&url=${encodeURIComponent(uri.href)}`;
                 * CDN: Photon
                 *return `https://i${hash}.wp.com/${uri.hostname + uri.pathname}`;
                 * CDN: staticaly
                 *return `https://cdn.staticaly.com/img/${uri.hostname + uri.pathname}`;
                 */
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
        // `works/${chapter.work.uniqid}/${chapter.uniqid}/`
    }
}