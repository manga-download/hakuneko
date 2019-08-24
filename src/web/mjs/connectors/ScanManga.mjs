import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ScanManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'scanmanga';
        super.label = 'ScanManga';
        this.tags = [ 'manga', 'french' ];
        this.url = 'http://www.scan-manga.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.requestOptions.headers.set( 'X-Requested-With', 'XMLHttpRequest' );
        fetch( this.url + '/scanlation/scan.data.json', this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                let mangaList = [];
                for(let title in data) {
                    let id = data[title][0];
                    let slug = data[title][1] || title;
                    mangaList.push( {
                        id: `/${id}/${slug}.html`,
                        title: title
                    } );
                }
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
        this.requestOptions.headers.delete( 'X-Requested-With' );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        this.fetchDOM( this.url + manga.id, 'div.texte_volume_manga ul li.chapitre div.chapitre_nom' )
            .then( data => {
                let chapterList = data
                    .filter( element => element.querySelector( 'a:first-of-type[href]' ) )
                    .map( element => {
                        let anchor = element.querySelector( 'a:first-of-type' );
                        return {
                            id: this.getRelativeLink( anchor ),
                            title: element.textContent.trim(),
                            language: 'fr'
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
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let baseURL = data.match( /['"](https?:\/\/lel\.scan-manga\.com:8080\/.*?\/\d+\/\d+\/.*?)['"]/ )[1];
                let pageList = [];
                let match = undefined;
                let regex = new RegExp( /\[\s*\d+\s*\]\s*=\s*['"](.*?zoneID.*?pageID.*?siteID.*?)['"]\s*;/g );
                // eslint-disable-next-line no-cond-assign
                while( match = regex.exec( data ) ) {
                    pageList.push( match[1] );
                }
                pageList = pageList.map( link => this.createConnectorURI( {
                    url: baseURL + link,
                    referer: request.url
                } ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _handleConnectorURI( payload ) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set( 'x-referer', payload.referer );
        let promise = super._handleConnectorURI( payload.url );
        this.requestOptions.headers.delete( 'x-referer' );
        return promise;
    }
}