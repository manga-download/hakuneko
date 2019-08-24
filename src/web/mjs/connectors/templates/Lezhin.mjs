import Connector from '../../engine/Connector.mjs';

export default class Lezhin extends Connector {

    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = undefined;
        this.apiURL = 'https://www.lezhin.com/api/v2'; // https://api.lezhin.com/v2
        this.cdnURL = 'https://cdn.lezhin.com';
        this.userID = undefined;
        this.accessToken = '995dba2e-8c5d-4249-b601-38c5d3e092e5';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: Input.text,
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: Input.password,
                value: ''
            }
        };
    }

    /**
     *
     */
    _initializeAccount() {
        return Promise.resolve()
            .then( () => {
                if( this.userID || !this.config.username.value || !this.config.password.value ) {
                    return Promise.resolve();
                } else {
                    let form = new URLSearchParams();
                    // TODO: remove own credentials
                    form.append( 'username', this.config.username.value );
                    form.append( 'password', this.config.password.value );
                    form.append( 'redirect', ( new URL( this.url ) ).pathname + '/account' );
                    this.requestOptions.method = 'POST';
                    this.requestOptions.body = form.toString();
                    this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
                    let promise = fetch( this.url + '/login/submit', this.requestOptions )
                        .then( response => response.text() )
                        .then( data => {
                            let cdn = data.match( /cdnUrl\s*:\s*['"]([^'"]+)['"]/ );
                            let user = data.match( /userId\s*:\s*['"](\d+)['"]/ );
                            let token = data.match( /token\s*:\s*['"]([^'"]+)['"]/ );
                            this.cdnURL = cdn ? cdn[1] : this.cdnURL;
                            this.userID = user ? user[1] : undefined;
                            this.accessToken = token ? token[1] : this.accessToken;
                            return Promise.resolve();
                        } )
                        .then( () => {
                            if( this.userID ) {
                                return fetch( this.url + '/adultkind?path=&sw=all', this.requestOptions );
                            } else {
                                return Promise.resolve();
                            }
                        } );
                    this.requestOptions.headers.delete( 'content-type' );
                    delete this.requestOptions.body;
                    this.requestOptions.method = 'GET';
                    return promise;
                }
            } )
            .then( () => {
            /*
             * force user locale user setting to be the same as locale from the currently used website ...
             * => prevent a warning webpage that would appear otherwise when loading chapters / pages
             */
                return fetch( this.url + '/locale/' + this.locale, this.requestOptions );
            } );
    }

    /**
     *
     */
    _getMangaFromPage( offset, limit ) {
        offset = offset || 0;
        limit = limit || 500;
        let uri = new URL( this.apiURL + '/comics' );
        uri.searchParams.set( 'offset', offset );
        uri.searchParams.set( 'limit', limit );
        uri.searchParams.set( 'country_code', '' );
        uri.searchParams.set( 'store', 'web' );
        uri.searchParams.set( 'adult_kind', 'all' );
        uri.searchParams.set( 'filter', 'all' );
        //uri.searchParams.set( '_', Date.now() );
        return fetch( uri.href, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                if( data.code ) {
                    throw new Error( data.description );
                }
                let mangaList = data.data.map( manga => {
                    return {
                        id: manga.alias, // manga.id
                        title: manga.title
                    };
                } );
                if( data.hasNext ) {
                    return this._getMangaFromPage( offset + limit, limit )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getMangaFromPage()
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
        let purchased = [];
        let subscription = false;
        this._initializeAccount()
            .then( () => {
                if( this.accessToken ) {
                    let uri = new URL( [this.cdnURL, 'v2/contents', manga.id, 'users'].join( '/' ) );
                    uri.searchParams.set( 'type', 'comic' );
                    /*
                     *uri.searchParams.set( 'country_code', 'us' );
                     *uri.searchParams.set( '_', Date.now() );
                     */
                    this.requestOptions.headers.set( 'authorization', 'Bearer ' + this.accessToken );
                    let promise = fetch( uri.href, this.requestOptions )
                        .then( response => response.json() )
                        .then( data => {
                            purchased = data.data.purchased;
                            subscription = data.data.subscribed;
                            return Promise.resolve();
                        } )
                        .catch( () => Promise.resolve() );
                    this.requestOptions.headers.delete( 'authorization' );
                    return promise;
                } else {
                    return Promise.resolve();
                }
            } )
            .then( () => fetch( this.url + '/comic/' + manga.id, this.requestOptions ) )
            .then( response => response.text() )
            .then( data => {
                let chapterList = JSON.parse( data.match( /"episodes"\s*:\s*(\[.*?\}\s*\])/ )[1] )
                    .filter( chapter => !chapter.coin || ( chapter.freedAt && chapter.freedAt < Date.now() ) || subscription || purchased.includes( chapter.id ) )
                    .map( chapter => {
                        return {
                            id: chapter.name, // chapter.id,
                            title: chapter.display.displayName + ' - ' + chapter.display.title,
                            language: this.locale
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
        this._initializeAccount()
        //.then( () => fetch( [this.url, 'comic', manga.id, chapter.id].join( '/' ), this.requestOptions ) )
            .then( () => {
                let uri = new URL( this.apiURL + '/inventory_groups/comic_viewer' );
                uri.searchParams.set( 'type', 'comic_episode' );
                uri.searchParams.set( 'alias', manga.id );
                uri.searchParams.set( 'name', chapter.id );
                /*
                 *uri.searchParams.set( 'platform', 'web' );
                 *uri.searchParams.set( 'store', 'web' );
                 */
                return fetch( uri.href, this.requestOptions );
            } )
            .then( response => response.json() )
            .then( data => {
                let comicID = data.data.extra.comic.id;
                let episodeID = data.data.extra.episode.id;
                /*
                 *let top = data.data.extra.episode.topInfo !== undefined;
                 *let bottom = data.data.extra.episode.bottomInfo !== undefined;
                 *let pageType = data.data.extra.episode.display.type; // 'g'
                 */
                let pages = 0;
                let path = '';
                //let q = 40;
                if( data.data.extra.episode.scroll ) {
                    pages = data.data.extra.episode.scroll;
                    path = 'scroll';
                    //q = 30;
                }
                let pageList = [...( new Array( pages ) ).keys()].map( page => {
                    let uri = new URL( [this.cdnURL, 'v2/comics', comicID, 'episodes', episodeID, 'contents', path + 's', page + 1].join( '/' ) );
                    uri.searchParams.set( 'access_token', this.accessToken );
                    //uri.searchParams.set( 'purchased', false );
                    //uri.searchParams.set( 'q', q );
                    //uri.searchParams.set( 'updated', 1539846001617 /* Date.now() */ );
                    return uri.href;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}