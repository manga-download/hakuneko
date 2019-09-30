import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 *
 */
export default class UraSunday extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'urasunday';
        super.label = '裏サンデー (Ura Sunday)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://urasunday.com';
    }

    /**
     *
     */
    _getMangaFromURI( uri ) {
        let request = new Request( uri.href, this.requestOptions );
        return this.fetchDOM( request, 'div#mainWrapper ul li.detailComicTitle h1' )
            .then( data => {
                let id = uri.pathname + uri.search;
                let title = data[0].innerText.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/list/index.html', this.requestOptions );
        /*let promiseManga = */this.fetchDOM( request, 'div#mainWrapper ul li.comicListWrapper div.comicListBox' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.querySelector( 'a.comicListBoxUD' ), request.url ),
                        title: element.querySelector( 'hgroup h1' ).innerText.trim()
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
        this.fetchDOM( request, 'ul#comicInfo li.comicWrapper div.comicInner ul li a:not(.iframe)' )
            .then( data => {
                let chapterList = data
                    .filter( element => !element.querySelector( 'source' ) && !element.href.includes( 'info.php' ) )
                    .map( element => {
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
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                let promises = [
                    this._extractComicWrite( data ),
                    this._extractWebarena( data ),
                    this._extractWebarenaNew( data, request.url ),
                    this._extractWebarenaMapon( data )
                ];
                // invert resolve / reject
                promises = promises.map( promise => promise.then( data => Promise.reject( data ), error => Promise.resolve( error ) ) );
                return Promise.all( promises )
                    .then(
                    // handler when all promises resolve (failed extracting image links)
                        error => Promise.reject( error || new Error( 'Failed to extract images, maybe provider not supported!' ) ),
                        // handler when first promise reject (success extracting image links)
                        data => callback( null, data )
                    );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _extractComicWrite( data ) {
        // https://urasunday.com/js/comic_write171201.js
        if( data.includes( '../js/comic_write' ) ) {
            let images = JSON.parse( data.match( /data\s*=\s*JSON\.parse\s*\(\s*'(.*)'/ )[1] );
            return Promise.resolve( images );
        } else {
            return Promise.reject();
        }
    }

    /**
     *
     */
    _extractWebarena( data ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write.js
        if( data.includes( 'urasunday/js/comic_write.js' ) ) {
            let base = 'https://webarena.tokyo-cdn.com/urasunday/manga/comic';
            let comic = data.match( /comic\s*=\s*['"]([^'"]+)['"]/ )[1];
            let type = 'pc'; // 'mobile' // data.match( /type\s*=\s*['"]([^'"]+)['"]/ )[1];
            let imgid = data.match( /imgid\s*=\s*['"]([^'"]+)['"]/ )[1];
            let subpath = imgid.split( '_' )[0];
            let ext = '.jpg';
            let max = parseInt( data.match( /comicMax\s*=\s*(\d+)/ )[1] );

            let images = [... new Array( max ).keys()].map( page => {
                let index = page + 1;
                index = index < 10 ? '0' + index : index;
                return [ base, comic, type, subpath, imgid + '_' + index + ext ].join( '/' );
            } );
            return Promise.resolve( images );
        } else {
            return Promise.reject();
        }
    }

    /**
     *
     */
    _extractWebarenaNew( data, referer ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write_new.js
        if( data.includes( 'urasunday/js/comic_write_new.js' ) ) {
            let base = 'https://tokyo-cdn.com/image/jpeg.php?page=';
            let max = parseInt( data.match( /comicMax\s*=\s*(\d+)/ )[1] );
            let imgid = data.match( /imgid\s*=\s*['"]([^'"]+)['"]/ )[1];

            this.requestOptions.method = 'POST';
            this.requestOptions.body = 'chapter=' + imgid;
            let request = new Request( this.url + '/set_token.php', this.requestOptions );
            request.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
            request.headers.set( 'x-referer', referer );
            this.requestOptions.method = 'GET';
            delete this.requestOptions.body;

            return fetch( request )
                .then( response => response.text() )
                .then( token => {
                    let images = [... new Array( max ).keys()].map( page => {
                        let index = page + 1;
                        return base + index + token;
                    } );
                    return Promise.resolve( images );
                } );
        } else {
            return Promise.reject();
        }
    }

    /**
     *
     */
    _extractWebarenaMapon( data ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write_mapon.js
        if( data.includes( 'urasunday/js/comic_write_mapon.js' ) ) {
            return this._extractWebarena( 'urasunday/js/comic_write.js' + data );
        } else {
            return Promise.reject();
        }
    }
}