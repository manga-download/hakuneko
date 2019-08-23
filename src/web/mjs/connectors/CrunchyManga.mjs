import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class CrunchyManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'crunchymanga';
        super.label = 'CrunchyManga (Premium*)';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://www.crunchyroll.com';
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.subscriptionID = 'manga';
        this.subscription = false;
        this.session = undefined;
        this.token = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            username: {
                label: 'Username',
                description: 'Username for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: Input.text,
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: Input.password,
                value: ''
            }
        };

        document.addEventListener( EventListener.onSettingsChanged, this._onSettingsChanged.bind( this ) );
    }

    /**
     *
     */
    _onSettingsChanged( event ) {
        this._logout().then( () => this._login( this.config.username.value, this.config.password.value ) );
    }

    /**
     * Login to crunchyroll website with username and password from settings to
     * get full access to all chapters.
     */
    _login( username, password ) {
        return this._crStartSession( [0,1].map(i => Math.random().toString(16).slice(-8)).join('') )
            .then( session => {
                this.session = session;
                if( !username || !password ) {
                    throw new Error( 'No login credentials provided!' );
                }
                return this._crLogin( this.session, username, password );
            } )
            .then( data => {
                this.token = data.auth;
                this.subscription = ( data.user.premium.includes( this.subscriptionID ) );
            } )
            .catch( error => {
                console.warn( this.label + ' initialization failed!', error );
            } );
    }

    /**
     *
     */
    _logout() {
        let promise = Promise.resolve();
        if( this.session ) {
            promise = this._crLogout( this.session );
        }
        this.session = undefined;
        this.token = undefined;
        this.subscription = false;
        return promise.catch( error => console.warn( this.label + ' logout failed!', error ) );
    }

    /**
     *
     */
    _validateSubscription() {
        if( !this.subscription ) {
            return Promise.reject( new Error( 'A paid subscription is required to access premium content.\nMake sure your account is configured in the settings.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.' ) );
        } else {
            return Promise.resolve();
        }
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._crListSeries( this.session )
            .then( data => {
                let mangaList = data.map( manga => {
                    return {
                        id: manga.series_id,
                        title: ( manga.locale && manga.locale.enUS ? manga.locale.enUS.name : manga.url.replace( /^\// , '' ) )
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
        this._crListChapters( this.session, manga.id )
            .then( data => {
                let chapterList = data.reverse().map( chapter => {
                    // chapter.volume_number
                    return {
                        id: chapter.chapter_id,
                        title: chapter.number.padStart( 7, '0' ) + ( chapter.locale && chapter.locale.enUS ? ' - ' + chapter.locale.enUS.name : '' ),
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
        this._validateSubscription()
            .then( () => this._crListPages(this.session, this.token, chapter.id ) )
            .then( data => {
                let pageList = data.map( page => {
                    /*
                     *let uri = new URL( page['image_url'] ); // sometimes invalid
                     *let uri = new URL( page.locale.enUS['image_url'] ); // this seems to be the raw image (png), but access is forbidden
                     *let uri = new URL( page.locale.enUS['composed_image_url'] ); // access is forbidden
                     *let uri = new URL( page.locale.enUS['encrypted_mobile_image_url'] ); // smaller size
                     */
                    let uri;
                    try {
                        uri = page.locale['enUS']['encrypted_composed_image_url'] || page.locale['enUS']['encrypted_mobile_image_url'];
                    } catch( error ) {
                        uri = page['image_url'];
                    }
                    return this.createConnectorURI( uri );
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
    _handleConnectorURI( payload ) {
        let request = new Request( payload, this.requestOptions );
        return fetch( request )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page (status: ${response.status}) - ${response.statusText}` );
                }
                return response.arrayBuffer()
                    .then( data => {
                        return Promise.resolve( {
                            mimeType: response.headers.get( 'content-type' ),
                            data: this._crDecryptImage( data, 0x42 )
                        } );
                    } );
            } );
    }

    /**
     *****************************
     * ** CRUNCHYROLL CODE BEGIN ***
     ****************************
     */

    /**
     *
     */
    get _crDevices() {
        return {
            crunchyroid: { type: 'com.crunchyroll.crunchyroid', token: 'Scwg9PRRZ19iVwD' },
            android: { type: 'com.crunchyroll.manga.android', token: 'FLpcfZH4CbW4muO' },
            ios: { type: 'com.crunchyroll.iphone', token: 'QWjz212GspMHH9h' }, // => seems not to work on desktop
            windows: { type: 'com.crunchyroll.windows.desktop', token: 'LNDJgOit5yaRIWN' }
        };
    }

    /**
     *
     */
    _crFetchJSON( uri, sessionID ) {
        let device = this._crDevices.windows;
        uri.searchParams.set( 'api_ver', '1' ); // mandatory
        uri.searchParams.set( 'device_type', device.type ); // mandatory
        if( sessionID ) {
            uri.searchParams.delete( 'access_token' ); // mandatory for start-session
            uri.searchParams.set( 'session_id', sessionID ); // optional for start-session
        } else {
            uri.searchParams.set( 'access_token', device.token ); // optional for non start-session
            uri.searchParams.delete( 'session_id' ); // mandatory for non start-session
        }
        uri.searchParams.set( 'locale', 'enUS' ); // optional
        return fetch( uri.href, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( data.error || ( data.code && data.code !== 'ok' ) ) {
                    throw new Error( data.code + ': ' + data.message );
                }
                return Promise.resolve( data.data || data );
            } );
    }

    /**
     *
     */
    _crStartSession( deviceID ) {
        //let uri = new URL( '/cr_start_session', 'https://api-manga.crunchyroll.com' );
        let uri = new URL( '/start_session.0.json', 'https://api.crunchyroll.com' );
        uri.searchParams.set( 'device_id', deviceID );
        return this._crFetchJSON( uri ).then( data => Promise.resolve( data.session_id ) );
    }

    /**
     *
     */
    _crLogin( sessionID, username, password ) {
        let uri = new URL( '/cr_login', 'https://api-manga.crunchyroll.com' );
        uri.searchParams.set( 'account', username );
        uri.searchParams.set( 'password', password );
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data ) );
    }

    /**
     *
     */
    _crLogout( sessionID ) {
        let uri = new URL( '/cr_logout', 'https://api-manga.crunchyroll.com' );
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data ) );
    }

    /**
     *
     */
    _crAuth( sessionID ) {
        let uri = new URL( '/cr_authenticate', 'https://api-manga.crunchyroll.com' );
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data ) );
    }

    /**
     *
     */
    _crListSeries( sessionID ) {
        let uri = new URL( '/series', 'https://api-manga.crunchyroll.com' );
        /*
         *let uri = new URL( '/list_series', 'https://api-manga.crunchyroll.com' );
         *uri.searchParams.set( 'series_id', '526' );
         */
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data ) );
    }

    /**
     *
     */
    _crListChapters( sessionID, seriesID ) {
        let uri = new URL( '/chapters', 'https://api-manga.crunchyroll.com' );
        //let uri = new URL( '/list_chapters', 'https://api-manga.crunchyroll.com' );
        uri.searchParams.set( 'series_id', seriesID );
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data.chapters ) );
    }

    /**
     *
     */
    _crListPages( sessionID, authToken, chapterID ) {
        //let uri = new URL( '/chapter', 'https://api-manga.crunchyroll.com' );
        let uri = new URL( '/list_chapter', 'https://api-manga.crunchyroll.com' );
        uri.searchParams.set( 'auth', authToken );
        uri.searchParams.set( 'chapter_id', chapterID );
        return this._crFetchJSON( uri, sessionID ).then( data => Promise.resolve( data.pages ) );
    }

    /**
     * encrypted must be ArrayBuffer
     * NOTE: the buffer data will be modified
     */
    _crDecryptImage( encrypted, key ) {
        // create a view for the buffer
        let decrypted = new Uint8Array( encrypted );
        for( let index in decrypted ) {
            decrypted[index] ^= key;
        }
        return decrypted;
    }

    /**
     ***************************
     * ** CRUNCHYROLL CODE END ***
     **************************
     */
}