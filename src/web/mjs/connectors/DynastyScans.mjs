import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 */
export default class DynastyScans extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'dynasty-scans';
        super.label = 'DynastyScans';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://dynasty-scans.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let promises = ['/series', '/anthologies', '/issues', '/doujins'].map( page => {
            return this.fetchJSON( this.url + `${page}.json` )
                .then( json => {
                    let mangaList = [];
                    for( let letter in json ) {
                        mangaList = mangaList.concat( ... json[letter].map( manga => {
                            return {
                                id: `${page}/${manga.permalink}`,
                                title: manga.name.trim()
                            };
                        }) );
                    }
                    return Promise.resolve( mangaList );
                } );
        } );

        Promise.all( promises )
            .then( mangas => {
                callback( null, [].concat( ... mangas ) );
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
        this.fetchJSON( this.url + manga.id + '.json' )
            .then( json => {
                // filter removes the "header" elements from the list
                let chapterList = json['taggings'].filter( chapter => !chapter.header ).map( chapter => {
                    let title = chapter.title.replace( manga.title, '' ).trim();
                    return {
                        id: `/chapters/${chapter.permalink}`,
                        title:  title === '' ? manga.title : title ,
                        language: 'en'
                    };
                } );
                // rename duplicate chapters, using a stack to count preceding chapters with the same name
                let titleStack = [];
                for( let chapter of chapterList ) {
                    // do not change the command order!
                    let duplicateCount = titleStack.filter( t => t === chapter.title ).length;
                    titleStack.push( chapter.title );
                    chapter.title += duplicateCount > 0 ? ' #' + duplicateCount : '' ;
                }
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
        this.fetchJSON( this.url + chapter.id + '.json' )
            .then( json => {
                let pageList = json['pages'].map( page => this.url + page.url );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}