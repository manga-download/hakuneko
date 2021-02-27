import Connector from '../../engine/Connector.mjs';

export default class ReaderFront extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.cdn = undefined;
        this.apiURL = undefined;

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
    _getMangaList( callback ) {
        let gql = {
            operationName: 'Works',
            variables: {
                languages: [ this.languageMap[this.language] ]
            },
            query: `query Works($languages: [Int]) {
                        works(languages: $languages, orderBy: "ASC", sortBy: "stub", first: 250, offset: 0, showHidden: true) {
                            id
                            stub
                            name
                        }
                    }`
        };
        this.fetchGraphQL(this.apiURL, gql.operationName, gql.query, gql.variables )
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
        let gql = {
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
        this.fetchGraphQL(this.apiURL, gql.operationName, gql.query, gql.variables )
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
        let gql = {
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
        this.fetchGraphQL(this.apiURL, gql.operationName, gql.query, gql.variables)
            .then( data => {
                let chapter = data.chapterById;
                let pageList = chapter.pages.map( page => {
                    let uri = new URL( ['/works', chapter.work.uniqid, chapter.uniqid, page.filename].join( '/' ), this.cdn );
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
