import UserAgent from './UserAgent.mjs';
import Cookie from './Cookie.mjs';

export default class Request {

    // TODO: use dependency injection instead of globals for Engine.Settings, Engine.Blacklist, Enums
    constructor(settings) {
        let electron = require( 'electron' );
        this.electronRemote = electron.remote;
        this.protocol = this.electronRemote.require( 'electron' ).protocol;
        this.browser = this.electronRemote.BrowserWindow;
        this.userAgent = UserAgent.random();

        this.electronRemote.app.on( 'login', this._loginHandler );
        this._settings = settings;
        this._settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    /**
     *
     */
    registerProtocol( scheme, callback ) {
        /*
         * register callback for electron process (when callback becomes unavailable by e.g. reloading page,
         * the previous registered handler must be removed)
         */
        this.protocol.isProtocolHandled( scheme, error => {
            if( error ) {
                this.protocol.unregisterProtocol( scheme, () => {
                    this.protocol.registerBufferProtocol( scheme, callback );
                } );
            } else {
                this.protocol.registerBufferProtocol( scheme, callback );
            }
        } );
    }

    /**
     * See: https://electronjs.org/docs/api/session#sessetproxyconfig-callback
     */
    _onSettingsChanged( event ) {
        let proxy = {};
        if( event.detail.proxyRules.value ) {
            proxy['proxyRules'] = event.detail.proxyRules.value;
        }
        this.electronRemote.session.defaultSession.setProxy( proxy, () => {} );
    }

    /**
     *
     */
    _loginHandler( evt, webContent, request, authInfo, callback ) {
        let proxyAuth = this._settings.proxyAuth.value;
        if( authInfo.isProxy && proxyAuth && proxyAuth.includes( ':' ) ) {
            let auth = proxyAuth.split( ':' );
            let username = auth[0];
            let password = auth[1];
            console.log('login event', authInfo.isProxy, username, password );
            callback( username, password );
        }
    }

    /**
     *
     */
    get _domPreparationScript() {
        return `
            {
                let images = [...document.querySelectorAll( 'img[onerror]' )];
                for( let image of images ) {
                    image.removeAttribute( 'onerror' );
                    image.onerror = undefined;
                }
            }
        `;
    }

    /**
     *
     */
    get _cfCheckScript() {
        // ensure variables in this script does not appear in the page or other injected script
        let uVar = [
            '_c13367', // 'code',
            '_d8fd50', // 'message',
            '_cb5e10', // 'error',
            '_e9a23c', // 'meta',
            '_d9904d', // 'cf',
            '_b4a884', // 'result',
        ];
        return `
            let ${uVar[0]} = document.querySelector( '.cf-error-code' );
            ${uVar[0]} = ( ${uVar[0]} ? ${uVar[0]}.innerText : null );
            let ${uVar[1]} = document.querySelector( 'h2[data-translate]' );
            ${uVar[1]} = ( ${uVar[1]} && ${uVar[1]}.nextElementSibling ? ${uVar[1]}.nextElementSibling.innerText : null );
            let ${uVar[2]} = ( ${uVar[0]} ? 'CF Error ' + ${uVar[0]} + ' => ' + ${uVar[1]} : null );

            let ${uVar[3]} = document.querySelector( 'meta[http-equiv="refresh"][content*="="]' );
            let ${uVar[4]} = document.querySelector( 'form#challenge-form' );

            let ${uVar[5]} = {
                error: ${uVar[0]},
                redirect: ( ${uVar[3]} || ${uVar[4]} )
            };
            ${uVar[5]};
        `;
    }

    /**
     * The browser window of electron does not support request objects,
     * so it is required to convert the request to supported options.
     */
    _extractRequestOptions(request) {
        /*let referer = request.headers.get( 'x-referer' );*/
        let cookie = request.headers.get('x-cookie');
        let headers = [];
        if(cookie) {
            headers.push('x-cookie: ' + cookie);
        }
        headers = headers.join( '\n' );
        return {
            /*
             *httpReferrer: referer ? referer : undefined,
             *userAgent: undefined,
             *postData: undefined,
             */
            extraHeaders: headers ? headers : undefined,
        };
    }

    /**
     * If timeout [ms] is given, the window will be kept open until timout, otherwise
     * it will be closed after injecting the script (or after 30 seconds in case an error occured)
     */
    fetchUI( request, injectionScript, timeout ) {
        timeout = timeout || 60000;
        return new Promise( ( resolve, reject ) => {
            let win = new this.browser( {
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    webSecurity: true,
                    images: false
                }
            } );
            //win.webContents.openDevTools();

            // TODO: blacklist seems to be applied to all web requests, not just to the one in this browser window

            win.webContents.session.webRequest.onBeforeRequest( { urls: Engine.Blacklist.patterns }, ( details, callback ) => {
                callback( { cancel: true } );
            } );

            let preventCallback = false;

            let abortAction = setTimeout( () => {
                this._fetchUICleanup( win, abortAction );
                if( !preventCallback ) {
                    reject( new Error( `Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!` ) );
                }
            }, timeout );

            win.webContents.on( 'dom-ready', () => {
                win.webContents.executeJavaScript( this._domPreparationScript );
            } );

            win.webContents.on( 'did-finish-load', () => {
                win.webContents.executeJavaScript( this._cfCheckScript )
                    .then( cfResult => {
                        if( !cfResult.redirect ) {
                            if( cfResult.error ) {
                                throw new Error( cfResult.error );
                            } else {
                                return win.webContents.executeJavaScript( injectionScript )
                                    .then( jsResult => {
                                        preventCallback = true; // no other event shall resolve/reject this promise anymore
                                        this._fetchUICleanup( win, abortAction );
                                        resolve( jsResult );
                                    } );
                            }
                        } else {
                        // neither reject nor resolve the promise (wait for next callback after getting redirected)
                            console.warn( `Solving CloudFlare challenge for "${request.url}" ...`, cfResult );
                        }
                    } )
                    .catch( error => {
                        preventCallback = true; // no other event shall resolve/reject this promise anymore
                        this._fetchUICleanup( win, abortAction );
                        reject( error );
                    } );
            } );

            win.webContents.on( 'did-fail-load', ( event, errCode, errMessage, uri, isMain ) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if( !preventCallback && errCode && errCode !== -3 && ( isMain || uri === request.url ) ) {
                    this._fetchUICleanup( win, abortAction );
                    reject( new Error( errMessage + ' ' + uri ) );
                }
            } );

            win.loadURL( request.url, this._extractRequestOptions( request ) );
        } );
    }

    /**
     * Close window and clear the given timeout function
     */
    _fetchUICleanup( browserWindow, abortAction ) {
        if( abortAction ) {
            clearTimeout( abortAction );
        }
        abortAction = null;
        if( browserWindow ) {
            browserWindow.close();
        }
        browserWindow = null;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow request is send.
     * DO NOT RENAME THIS METHOD!
     */
    onBeforeSendHeadersHandler( details ) {
        try {
            details = JSON.parse( Buffer.from( details, 'base64' ).toString( 'utf8' ) );
        } catch( error ) {
            console.log( error, details );
            return undefined;
        }
        let uri = new URL( details.url );

        // Remove accidently added headers from opened developer console
        for( let header in details.requestHeaders ) {
            if( header.startsWith( 'X-DevTools' ) ) {
                delete details.requestHeaders[header];
            }
        }

        // Overwrite the Host header with the one provided by the connector
        if( details.requestHeaders['x-host'] ) {
            details.requestHeaders['Host'] = details.requestHeaders['x-host'];
        }
        delete details.requestHeaders['x-host'];

        // Always overwrite the electron user agent
        if( details.requestHeaders['User-Agent'].toLowerCase().includes( 'electron' ) ) {
            details.requestHeaders['User-Agent'] = this.userAgent;
        }
        // If a custom user agent is set use this instead
        if( details.requestHeaders['x-user-agent'] ) {
            details.requestHeaders['User-Agent'] = details.requestHeaders['x-user-agent'];
            delete details.requestHeaders['x-user-agent'];
        }

        /*
         * Overwrite the Referer header, but
         * NEVER overwrite the referer for cloudflare's DDoS protection to prevent infinite redirects!
         */
        if( !uri.pathname.includes( 'chk_jschl' ) ) {
            // Priority 1: Force referer for certain hosts
            if( uri.hostname.includes( '.mcloud.to' ) ) {
                details.requestHeaders['Referer'] = uri.href;
            }
            // Priority 2: Use referer provided by connector
            else if( details.requestHeaders['x-referer'] ) {
                details.requestHeaders['Referer'] = details.requestHeaders['x-referer'];
            }
        }
        delete details.requestHeaders['x-referer'];

        // Overwrite the Origin header
        if( details.requestHeaders['x-origin'] ) {
            details.requestHeaders['Origin'] = details.requestHeaders['x-origin'];
        }
        delete details.requestHeaders['x-origin'];

        // Append Cookie header
        if( details.requestHeaders['x-cookie'] ) {
            let cookiesORG = new Cookie( details.requestHeaders['Cookie'] );
            let cookiesNEW = new Cookie( details.requestHeaders['x-cookie'] );
            details.requestHeaders['Cookie'] = cookiesORG.merge( cookiesNEW ).toString();
        }
        delete details.requestHeaders['x-cookie'];

        return details;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow response is received.
     * DO NOT RENAME THIS METHOD!
     */
    onHeadersReceivedHandler( details ) {
        try {
            details = JSON.parse( Buffer.from( details, 'base64' ).toString( 'utf8' ) );
        } catch( error ) {
            console.error( error, details );
            return undefined;
        }
        let uri = new URL( details.url );

        /*
         * Some video sreaming sites (Streamango, OpenVideo) using 'X-Redirect' header instead of 'Location' header,
         * but fetch API only follows 'Location' header redirects => assign redirect to location
         */
        let redirect = details.responseHeaders['X-Redirect'] || details.responseHeaders['x-redirect'];
        if( redirect ) {
            details.responseHeaders['Location'] = redirect;
        }
        if( uri.hostname.includes( 'mp4upload' ) ) {
            /*
             *details.responseHeaders['Access-Control-Allow-Origin'] = '*';
             *details.responseHeaders['Access-Control-Allow-Methods'] = 'HEAD, GET';
             */
            details.responseHeaders['Access-Control-Expose-Headers'] = ['Content-Length'];
        }

        return details;
    }
}