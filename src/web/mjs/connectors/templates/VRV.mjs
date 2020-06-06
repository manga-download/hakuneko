import Connector from '../../engine/Connector.mjs';

export default class VRV extends Connector {

    constructor() {
        super();
        this.api = {
            base: 'https://api.vrv.co',
            core: 'https://api.vrv.co/core',
            cms: undefined,
            public: undefined,
            private: undefined
        };
        this.subscriptionID = 'vrv';
        this.subscription = false;
        this.regionBlock = true;
        this.policies = [];
        this.oauth = OAuth( {
            consumer: {
                key: 'OvqR158Z9212i41UkNRzooutpU9Vp0vuXD9K0zKAvJdXPh6LfMOro4stVQRS',
                secret: 'EBgJav6Z99M9jFLzcexL6iETovNGbobFAJGudkDKMloqaBJgdo9u3WNuumM1'
            },
            signature_method: 'HMAC-SHA1',
            hash_function: ( data, key ) => {
                return CryptoJS.HmacSHA1( data, key ).toString( CryptoJS.enc.Base64 );
            }
        } );
        this.oauthToken = undefined;

        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your VRV account.\nAn account is required to access R-rated content.\nA paid subscription is required to access premium content.\n\nDisclaimer: HakuNeko may drop support for VRV at any time.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your VRV account.\nAn account is required to access R-rated content.\nA paid subscription is required to access premium content.\n\nDisclaimer: HakuNeko may drop support for VRV at any time.',
                input: 'password',
                value: ''
            },
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many concurrent requests.\nSlightly increase the value when getting errors during episode/movie download.',
                input: 'numeric',
                min: 100,
                max: 5000,
                value: 250
            }
        };

        // TODO: change behavior to login on demand (if not logged-in and credentials exist, try login), instead of event listener login
        Engine.Settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        Engine.Settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    /**
     *
     */
    _getSeries() {
        let seriesURI = new URL( this.api.public + '/browse' );
        seriesURI.searchParams.append( 'channel_id', this.subscriptionID );
        seriesURI.searchParams.append( 'sort_by', 'alphabetical' );
        seriesURI.searchParams.append( 'n', 10000 );
        seriesURI.searchParams.append( 'start', 0 );
        seriesURI.searchParams.append( 'q', '' );

        return this._mergePolicyParams( seriesURI.href )
            .then( href => fetch( href, this.requestOptions ) )
            .then( response => this._getResponseJSON( response ) )
            .then( data => this._getSeasons( data ) );
    }

    /**
     *
     */
    _getSeasons( data ) {
        let seasonsURI = new URL( this.api.cms + '/seasons' );

        // series with seasons ...
        let promises = data.items.filter( entry => entry.type === 'series' )/*.slice( 0, 15 )*/.map( serie => {
            seasonsURI.searchParams.set( 'series_id', serie.id );
            return this._mergePolicyParams( seasonsURI.href )
                .then( href => fetch( href, this.requestOptions ) )
                .then( response => this._getResponseJSON( response ) )
                .then( data => {
                    let seasons = data.items.map( s => {
                        return {
                            id: s.id,
                            title: serie.title
                            + ( typeof s.season_number === 'number' ? ' [S' + ( '0' + s.season_number ).slice( -2 ) + ']' : '' )
                            + ( s.is_dubbed ? ' (dub)' : s.is_subbed ? ' (sub)' : '' )
                        };
                    } );
                    return Promise.resolve( seasons );
                } );
        } );

        // everything that has no seasons (e.g. movies) ...
        promises.push( Promise.resolve( data.items.filter( entry => entry.type !== 'series' ).map( movie => {
            return {
                id: movie.id,
                title: movie.title + ( movie[movie.type + '_metadata'].is_dubbed ? ' (dub)' : movie[movie.type + '_metadata'].is_subbed ? ' (sub)' : '')
            };
        } ) ) );

        return Promise.all( promises )
            .then( data => {
                let result = data.reduce( ( accumulator, seasons ) => accumulator.concat( seasons ) );
                return Promise.resolve( result );
            }, [] );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getSeries()
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
        Promise.resolve()
            .then( () => {
                if( this.regionBlock ) {
                    throw new Error( this.label + ' is not available in your country!\nYou need an US vpn in order to access the content.' );
                }
                // anime could be episodes or movies => request both
                let episodeURI = new URL( this.api.cms + '/episodes' );
                episodeURI.searchParams.append( 'season_id', manga.id );
                let movieURI = new URL( this.api.cms + '/movies' );
                movieURI.searchParams.append( 'movie_listing_id', manga.id );

                let promises = [episodeURI, movieURI].map( uri => {
                    return this._mergePolicyParams( uri.href )
                        .then( href => fetch( href, this.requestOptions ) )
                        .then( response => this._getResponseJSON( response ) )
                        .catch( error => Promise.resolve( error) );
                } );
                return Promise.all( promises );
            } )
            .then( data => {
                let episodes = data.reduce( ( accumulator, media ) => {
                    if( !( media instanceof Error ) && media.items instanceof Array ) {
                        accumulator = accumulator.concat( media.items );
                    }
                    return accumulator;
                }, [] );
                return Promise.resolve( episodes );
            } )
            .then( episodes => {
                let promises = episodes.filter( episode => {
                    return (
                        ( !episode.is_premium_only || this.subscription )
                        && ( !episode.is_mature || this.oauthToken )
                        && episode.__links__.streams
                    );
                } )
                    .map( episode => {
                        return this._replicateEpisodeByStreams( episode );
                    } );
                return Promise.all( promises );
            } )
            .then( episodes => {
                let episodeList = episodes.reduce( ( accumulator, current ) => accumulator.concat( current ), [] );
                callback( null, episodeList );
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
        try {
            callback( null, chapter.id );
        } catch( error ) {
            console.error( error, chapter );
            callback( error, undefined );
        }
    }

    /**
     * Split the given episode in multiple episodes for each audio langauge and each corresponding resolution.
     */
    _replicateEpisodeByStreams( episode ) {
        return this._getAllStreams( this.api.base + episode.__links__.streams.href )
            .then( meta => {
                let prefix = '';
                let volume = episode.season_number ? 'S' + ( '0' + episode.season_number ).slice( -2 ) : '' ;
                let number = episode.episode_number ? 'E' + ( '00' + episode.episode_number ).slice( -3 ) : '' ;
                prefix += volume;
                prefix += prefix.length > 0 && number.length > 0 ? '.' : '' ;
                prefix += number;
                prefix += prefix.length > 0 ? ' - ' : '' ;
                prefix += episode.title;
                let reproducedEpisodes = meta.streams.reduce( ( accumulator, localizedStream ) => {
                    let lng = localizedStream.locale ? ' (' + localizedStream.locale + ')' : '' ;
                    let episodeStreams = localizedStream.resolutions.map( resolution => {
                        let res = resolution.height ? ' [' + resolution.height + 'p]' : '' ;
                        return {
                            id: {
                                hash: [episode.id, localizedStream.locale, resolution.height].join( ',' ),
                                mirrors: resolution.mirrors,
                                subtitles: meta.subtitles
                            },
                            title: prefix + lng + res,
                            language: localizedStream.locale || '- NO HARDSUB -'
                        };
                    } );
                    return accumulator.concat( episodeStreams );
                }, [] );
                return Promise.resolve( reproducedEpisodes );
            } );
        // TODO: on error resolve with empty streams?
        //.catch( error => console.error( error )/*Promise.resolve( error )*/ );
    }

    /**
     * Return a promise that resolves with all hardsub localized streams including
     * all their resolutions and the corresponding m3u8 playlist mirrors for the given episode.
     */
    _getAllStreams( episodeURL ) {
        return this._mergePolicyParams( episodeURL )
            .then( href => fetch( href, this.requestOptions ) )
            .then( response => this._getResponseJSON( response ) )
            .then( meta => {
                let subtitles = Object.keys( meta.subtitles ).map( key => meta.subtitles[ key ] );
                let localizedStreams = Object.keys( meta.streams.adaptive_hls ).map( key => meta.streams.adaptive_hls[ key ] );
                let promises = localizedStreams.map( stream => this._getStreamWithResolutions( stream ) );
                return Promise.all( promises )
                    .then( streams => {
                        return Promise.resolve( {
                            subtitles: subtitles,
                            streams: streams
                        } );
                    } );
            } );
    }

    /**
     * Return a promise that resolves with all resolutions and
     * all their corresponding m3u8 playlist mirrors for the given localized stream.
     */
    _getStreamWithResolutions( stream ) {
        return fetch( stream.url, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive episode streams (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let resolutions = data.split( '#EXT-X-STREAM-INF:' )
                    .filter( entry => entry.indexOf( 'RESOLUTION' ) > -1 )
                    .map( entry => {
                        return {
                            height: parseInt( entry.match( /RESOLUTION=(\d+)x(\d+),/i )[2] ),
                            playlist: entry.split( '\n' )[1].trim()
                        };
                    } )
                    .reduce( ( accumulator, current ) => {
                        let entry = accumulator.find( entry => entry.height === current.height );
                        if( !entry ) {
                            accumulator.push( {
                                height: current.height,
                                mirrors: [ current.playlist ]
                            } );
                        } else {
                            entry.mirrors.push( current.playlist );
                        }
                        return accumulator;
                    }, [] );
                return Promise.resolve( {
                    locale: stream.hardsub_locale,
                    resolutions: resolutions
                } );
            } );
    }

    /**
     *
     */
    _onSettingsChanged() {
        let user = this.config.username.value;
        let pass = this.config.password.value;
        let credentials = user + pass;
        if(this._credentials !== credentials) {
            this._credentials = credentials;
            this._login(user, pass)
                .catch( error => {
                    console.warn( this.label + ' login failed!', error );
                    return Promise.resolve();
                } )
                .then( () => this._init() )
                .catch( error => {
                    console.warn( this.label + ' initialization failed!', error );
                } );
        }
    }

    /**
     *
     */
    _getResponseJSON( response ) {
        if( response.status === 403 ) {
            this._logout();
        }
        return response.json()
            .then( data => {
                if( response.status !== 200 ) {
                    if( data.__class__ === 'error' ) {
                        throw new Error( /*'[' + data.code + '] ' +*/ data.type + ': ' + data.message );
                    } else {
                        throw new Error( `${response.status} - ${response.statusText} => No additional error information available!` );
                    }
                }
                return Promise.resolve( data );
            } );
    }

    /**
     * Append additional search parameters to the given URL based on the assigned policy rules.
     */
    _mergePolicyParams( url ) {
        try {
            let uri = new URL( url );
            let path = uri.pathname;
            this.policies.filter( policy => {
                let regex = new RegExp( '^' + policy.path.replace( /\*/g, '.' ) );
                return regex.test( path );
            } ).forEach( policy => {
                uri.searchParams.append( policy.name, policy.value );
            } );
            return Promise.resolve( uri.href );
        } catch( error ) {
            console.error( error, this.policies );
            return Promise.reject( error );
        }
    }

    /**
     * oAuth signature is based on method, url and GET/POST parameters
     * => https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature.html
     */
    _oauthRequest( oauthRequest ) {
        try {
            this.requestOptions.method = oauthRequest.method;
            if( oauthRequest.method.toLowerCase() === 'post' ) {
                /*
                 * this.requestOptions.body = Object.keys( oauthRequest.data ).reduce( ( form, key ) => {
                 * form.append( key, oauthRequest.data[key] );
                 * return form;
                 * }, new FormData() );
                 */
                // FormData does not play along with oAuth ... => use base URLSearchPArmeters and set header manually
                this.requestOptions.body = Object.keys( oauthRequest.data ).reduce( ( params, key ) => {
                    params.append( key, oauthRequest.data[key] );
                    return params;
                }, new URLSearchParams() ).toString();
                this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
            }
            let oauthHeaders = this.oauth.toHeader( this.oauth.authorize( oauthRequest, this.oauthToken ) );
            this.requestOptions.headers.set( 'authorization', oauthHeaders['Authorization'] );

            // NOTE: vrv blocks any request with forwarded ip address header
            let promise = fetch( oauthRequest.url, this.requestOptions );

            // finally: reset request options before returning promise ...
            this.requestOptions.headers.delete( 'authorization' );
            this.requestOptions.headers.delete( 'content-type' );
            delete this.requestOptions.body;
            this.requestOptions.method = 'GET';

            return promise;
        } catch( error ) {
            return Promise.reject( error );
        }
    }

    /**
     * Login to vrv website with username and password from settings to
     * get full access to all series.
     */
    _login( username, password ) {
        return new Promise( resolve => {
            this._logout();
            if( typeof username === 'string' && username !== '' && typeof password === 'string' && password !== '' ) {
                resolve( {
                    email: username,
                    password: password
                } );
            } else {
                throw new Error( 'No login credentials provided!' );
            }
        } )
            .then( form => {
                let oauthRequest = {
                    method: 'POST',
                    url: this.api.core + '/authenticate/by:credentials',
                    data: form
                };
                return this._oauthRequest( oauthRequest );
            } )
            .then( response => this._getResponseJSON( response ) )
            .then( data => {
                this.oauthToken = {
                    key: data.oauth_token,
                    secret: data.oauth_token_secret
                };
                return Promise.resolve();
            } );
    }

    /**
     *
     */
    _logout() {
        this.oauthToken = undefined;
        this.api.cms = undefined;
        this.api.public = undefined;
        this.api.private = undefined;
        this.subscription = false;
        this.regionBlock = true;
    }

    /**
     *
     */
    _init() {
        try {
            if( this.api.cms && this.api.public && this.api.private ) {
                this.initialized = undefined;
                return Promise.resolve( this.initialized );
            }
            // requires US proxy
            let oauthRequest = {
                method: 'GET',
                url: this.api.core + '/index',
                data: {}
            };
            return this._oauthRequest( oauthRequest )
                .then( response => this._getResponseJSON( response ) )
                .then( data => {
                    // FIXME: path should use /v2/ instead of /v1/ for non-registered users ...
                    this.api.cms = this.api.base + data.__links__.cms_index.href.replace( /\/index$/, '' );
                    this.api.cms = this.api.base + data.__links__['cms_index.v2'].href.replace( /\/index$/, '' );
                    this.api.public = this.api.base + data.__links__.disc_index_unsigned.href.replace( /\/index$/, '' ).replace( '/private/', '/public/' ).replace( /\/\d+$/, '/-');
                    this.api.private = this.api.base + data.__links__.disc_index_unsigned.href.replace( /\/index$/, '' );
                    this.policies = data.signing_policies;
                    // verify if premium access is granted
                    this.subscription = this.api.private.indexOf( this.subscriptionID ) > -1 ;
                    this.regionBlock = !data.service_available;
                    this.initialized = true;
                    return Promise.resolve( this.initialized );
                } );
        } catch( error ) {
            return Promise.reject( error );
        }
    }
}