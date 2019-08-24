import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class DigitalTeam extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'digitalteam';
        super.label = 'DigitalTeam';
        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];
        this.url = 'https://dgtread.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/reader/series', 'div#series_list ul li.manga_block ul li.manga_info div.manga_title a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
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
        this.fetchDOM( this.url + manga.id, 'div.chapter_list ul li div.ch_top a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: 'it'
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
        let external = false;
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                external = data.includes( 'js/jq_rext.js' );
                this._setPageRequestOptions( manga, chapter, external );
                let promise = fetch( this.url + '/reader/c_i', this.requestOptions );
                this._clearRequestOptions();
                return promise;
            } )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
            } )
            .then( data => {
                data = typeof data === 'string' ? JSON.parse( data ) : data ;
                let pageList = data[0].map( ( file, index ) => {
                    if( external ) {
                        return data[1][index] + file.name + file.ex;
                    } else {
                        return this.url + '/reader' + data[2] + file.name + data[1][index] + file.ex;
                    }
                } );
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
    _setPageRequestOptions( manga, chapter, external ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.body = new URLSearchParams( {
            'info[manga]': manga.id.split( '/' ).pop(),
            'info[chapter]': chapter.id.split( '/' ).slice( -2 )[0],
            'info[ch_sub]': 0,
            'info[title]': 'Digital Team'
        } );
        if( external ) {
            this.requestOptions.body.set( 'info[external]', 1 );
        }
    }

    /**
     *
     */
    _clearRequestOptions() {
        delete this.requestOptions.body;
        this.requestOptions.headers.delete( 'content-type' );
        this.requestOptions.method = 'GET';
    }
}