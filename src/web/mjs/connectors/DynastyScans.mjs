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
    async _getMangaList( callback ) {
        try {
            let promises = ['/series', '/anthologies', '/issues', '/doujins'].map( async page => {
                let json = await this.fetchJSON( this.url + `${page}.json` );
                let mangaList = [];
                for( let letter in json ) {
                    mangaList = mangaList.concat( ... json[letter].map( manga => {
                        return {
                            id: `${page}/${manga.permalink}`,
                            title: manga.name.trim()
                        };
                    }) );
                }
                return mangaList;
            } );
            let mangas = await Promise.all( promises );
            callback( null, [].concat( ... mangas ) );
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getChapterList( manga, callback ) {
        try {
            let json = await this.fetchJSON( new URL(this.url + manga.id + '.json', this.url).href );
            // filter removes the "header" elements from the list
            let chapterList = json['taggings'].filter( chapter => !('header' in chapter) ).map( chapter => {
                return {
                    id: `/chapters/${chapter.permalink}`,
                    title: chapter.title.trim(),
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
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getPageList( manga, chapter, callback ) {
        try {
            let json = await this.fetchJSON( new URL(this.url + chapter.id + '.json', this.url).href );
            let pageList = json['pages'].map( page => this.url + page.url );
            callback( null, pageList );
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}