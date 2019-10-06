import Connector from '../engine/Connector.mjs';

export default class MangaSail extends Connector {

    constructor() {
        super();
        super.id = 'mangasail';
        super.label = 'MangaSail';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangasail.co';

        this.config = {
            username: {
                label: 'Username',
                description: 'Username for login with your account.\nVarious chapters will only be accessable after login.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your account.\nVarious chapters will only be accessable after login.',
                input: 'password',
                value: ''
            }
        };

        // TODO: change behavior to login on demand (if not logged-in and credentials exist, try login), instead of event listener login
        Engine.Settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        Engine.Settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'table.directory_list tr td:first-of-type a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /Manga\s*$/, '' ).trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/directory?page=9999', 'ul.pagination li:last-of-type a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/directory?page=' + page );
                return this._getMangaListFromPages( pageLinks );
            } )
            .then( data => {
                callback( null, data );
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
        this.fetchDOM( this.url + manga.id, 'table.chlist tr td:first-of-type a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
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
        this.fetchDOM( this.url + chapter.id + '?page=all', 'div#images a source' )
            .then( data => {
                let pageLinks = data.map( element => element.src );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _onSettingsChanged() {
        let user = this.config.username.value;
        let pass = this.config.username.value;
        let credentials = user + pass;
        if(this._credentials !== credentials && user && pass) {
            this._credentials = credentials;
            fetch( this.url + '/user/logout', this.requestOptions )
                .then( () => this.fetchDOM( this.url + '/user/login', 'form#user-login input' ) )
                .then( data => {
                    if( !data || data.length < 3 ) {
                        throw new Error( `Failed to get ${this.label} login form, this may happen when already logged in!` );
                    }
                    let form = new URLSearchParams();
                    data.forEach( input => {
                        form.append( input.name, input.value );
                    } );
                    form.set( 'name', user );
                    form.set( 'pass', pass );
                    return Promise.resolve( form );
                } )
                .then( form => {
                    this._setLoginRequestOptions( form );
                    // NOTE: on success the session cookie will be set for all future requests
                    let promise = fetch( this.url + '/system/ajax', this.requestOptions );
                    this._clearRequestOptions();
                    return promise;
                } )
                .then( response => response.json() )
                .then( data => {
                    let success =
                        data.length === 3
                        && data[0]['command'] === 'settings'
                        && data[1]['command'] === 'modal_display'
                        && data[2]['command'] === 'reload';
                    return success ? Promise.resolve() : Promise.reject(new Error('Invalid login credentials!'));
                } )
                .catch( error => console.warn( 'Login failed', this.label, error ) );
        }
    }

    /**
     *
     */
    _setLoginRequestOptions( form ) {
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.body = form;
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