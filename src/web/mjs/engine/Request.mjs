import UserAgent from './UserAgent.mjs';
import Cookie from './Cookie.mjs';

export default class Request {

    // TODO: use dependency injection instead of globals for Engine.Settings, Engine.Blacklist, Enums
    constructor(ipc, settings) {
        let electron = require( 'electron' );
        this.electronRemote = electron.remote;
        this.browser = this.electronRemote.BrowserWindow;
        this.userAgent = UserAgent.random();

        this.electronRemote.app.on( 'login', this._loginHandler );
        ipc.listen('on-before-send-headers', this.onBeforeSendHeadersHandler.bind(this));
        ipc.listen('on-headers-received', this.onHeadersReceivedHandler.bind(this));

        this._settings = settings;
        this._settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    async _initializeHCaptchaUUID(settings) {
        let hcCookies = await this.electronRemote.session.defaultSession.cookies.get({ name: 'hc_accessibility' });
        let isCookieAvailable = hcCookies.some(cookie => cookie.expirationDate > Date.now()/1000 + 1800);
        if(settings.hCaptchaAccessibilityUUID.value && !isCookieAvailable) {
            let script = `
                new Promise(resolve => {
                    document.querySelector('button[title*="cookie"]').click();
                    setTimeout(() => resolve(document.cookie), 2500);
                });
            `;
            let uri = new URL('https://accounts.hcaptcha.com/verify_email/' + settings.hCaptchaAccessibilityUUID.value);
            let request = new window.Request(uri);
            let data = await this.fetchUI(request, script, 30000);
            if(data.includes('hc_accessibility=')) {
                console.log('Initialization of hCaptcha accessibility signup succeeded.', data);
            } else {
                // Maybe quota of cookie requests exceeded
                // Maybe account suspension because of suspicious behavior/abuse
                console.warn('Initialization of hCaptcha accessibility signup failed!', data);
            }
        }
    }

    _initializeProxy(settings) {
        // See: https://electronjs.org/docs/api/session#sessetproxyconfig-callback
        let proxy = {};
        if(settings.proxyRules.value) {
            proxy['proxyRules'] = settings.proxyRules.value;
        }
        this.electronRemote.session.defaultSession.setProxy(proxy, () => {});
    }

    _onSettingsChanged(event) {
        this._initializeProxy(event.detail);
        this._initializeHCaptchaUUID(event.detail);
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

    get _scrapingCheckScript() {
        return `
            new Promise((resolve, reject) => {

                function handleError(message) {
                    reject(new Error(message));
                }

                function handleNoRedirect() {
                    resolve(undefined);
                }

                function handleAutomaticRedirect() {
                    resolve('automatic');
                }

                function handleUserInteractionRequired() {
                    resolve('interactive');
                }

                // Common Checks
                if(document.querySelector('meta[http-equiv="refresh"][content*="="]')) {
                    return handleAutomaticRedirect();
                }

                // CloudFlare Checks
                let cfCode = document.querySelector('.cf-error-code');
                if(cfCode) {
                    return handleError('CloudFlare Error ' + cfCode.innerText);
                }
                if(document.querySelector('form#challenge-form[action*="_jschl_"]')) { // __cf_chl_jschl_tk__
                    return handleAutomaticRedirect();
                }
                if(document.querySelector('form#challenge-form[action*="_captcha_"]')) { // __cf_chl_captcha_tk__
                    return handleUserInteractionRequired();
                }

                // DDoS Guard Checks
                if(document.querySelector('div#link-ddg a[href*="ddos-guard"]')) { // Sample => https://manga-tr.com
                    return handleAutomaticRedirect();
                }

                // AreYouHuman Checks
                if(document.querySelector('form[action*="AreYouHuman"]')) {
                    return handleUserInteractionRequired();
                }

                // Default
                handleNoRedirect();
            });
        `;
    }

    async _checkScrapingRedirection(win) {
        let scrapeRedirect = await win.webContents.executeJavaScript(this._scrapingCheckScript);
        if(scrapeRedirect === 'automatic') {
            return true;
        }
        if(scrapeRedirect === 'interactive') {
            win.setSize(1280, 720);
            win.center();
            win.show();
            win.focus();
            return true;
        }
        return false;
    }

    /**
     * The browser window of electron does not support request objects,
     * so it is required to convert the request to supported options.
     */
    _extractRequestOptions(request) {
        let referer = request.headers.get('x-referer');
        let cookie = request.headers.get('x-cookie');
        let headers = [];
        if(cookie) {
            headers.push('x-cookie: ' + cookie);
        }
        headers = headers.join( '\n' );
        return {
            /*
             *userAgent: undefined,
             *postData: undefined,
             */
            httpReferrer: referer ? referer : undefined,
            extraHeaders: headers ? headers : undefined
        };
    }

    async fetchJapscan(request, preloadScript, runtimeScript, action, preferences, timeout) {
        timeout = timeout || 60000;
        preferences = preferences || {};
        let preloadScriptFile = undefined;
        if(preloadScript) {
            preloadScriptFile = await Engine.Storage.saveTempFile(Math.random().toString(36), preloadScript);
        }
        let win = new this.browser({
            show: false,
            webPreferences: {
                //partition: 'japscan',
                preload: preloadScriptFile,
                nodeIntegration: preferences.nodeIntegration || false,
                webSecurity: preferences.webSecurity || false,
                images: preferences.images || false
            }
        });
        //win.webContents.openDevTools();

        if(preferences.onBeforeRequest) {
            win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
                if(details.webContentsId === win.webContents.id) {
                    preferences.onBeforeRequest(details, callback);
                } else {
                    callback({ cancel: false });
                }
            });
        }

        return new Promise((resolve, reject) => {
            let preventCallback = false;

            let abortAction = setTimeout(() => {
                this._fetchUICleanup(win, abortAction);
                if(!preventCallback) {
                    reject(new Error(`Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!`));
                }
            }, timeout );

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup(win, abortAction);
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(runtimeScript);
                    win.webContents.debugger.attach('1.3');
                    let actionResult = await action(jsResult, win.webContents);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup( win, abortAction );
                    resolve(actionResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.loadURL(request.url, this._extractRequestOptions(request));
        });
    }

    async fetchBrowser(request, preloadScript, runtimeScript, preferences, timeout) {
        timeout = timeout || 60000;
        preferences = preferences || {};
        let preloadScriptFile = undefined;
        if(preloadScript) {
            preloadScriptFile = await Engine.Storage.saveTempFile(Math.random().toString(36), preloadScript);
        }
        let win = new this.browser({
            show: false,
            webPreferences: {
                preload: preloadScriptFile,
                nodeIntegration: preferences.nodeIntegration || false,
                webSecurity: preferences.webSecurity || false,
                images: preferences.images || false
            }
        });
        //win.webContents.openDevTools();

        // TODO: blacklist seems to be applied to all web requests, not just to the one in this browser window
        win.webContents.session.webRequest.onBeforeRequest({ urls: Engine.Blacklist.patterns }, (_, callback) => callback({ cancel: true }));

        return new Promise((resolve, reject) => {
            let preventCallback = false;

            let abortAction = setTimeout(() => {
                this._fetchUICleanup(win, abortAction);
                if(!preventCallback) {
                    reject(new Error(`Failed to load "${request.url}" within the given timeout of ${Math.floor(timeout/1000)} seconds!`));
                }
            }, timeout );

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup(win, abortAction);
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(runtimeScript);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup( win, abortAction );
                    resolve(jsResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.loadURL(request.url, this._extractRequestOptions(request));
        });
    }

    /**
     * If timeout [ms] is given, the window will be kept open until timout, otherwise
     * it will be closed after injecting the script (or after 60 seconds in case an error occured)
     */
    async fetchUI( request, injectionScript, timeout, images ) {
        timeout = timeout || 60000;
        return new Promise( ( resolve, reject ) => {
            let win = new this.browser( {
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                    webSecurity: false,
                    images: images
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

            win.webContents.on('dom-ready', () => win.webContents.executeJavaScript(this._domPreparationScript));

            win.webContents.on('did-finish-load', async () => {
                try {
                    if(await this._checkScrapingRedirection(win)) {
                        return;
                    }
                    let jsResult = await win.webContents.executeJavaScript(injectionScript);
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    resolve(jsResult);
                } catch(error) {
                    preventCallback = true; // no other event shall resolve/reject this promise anymore
                    this._fetchUICleanup(win, abortAction);
                    reject(error);
                }
            });

            win.webContents.on('did-fail-load', (event, errCode, errMessage, uri, isMain) => {
                // this will get called whenever any of the requests is blocked by the client (e.g. by the blacklist feature)
                if(!preventCallback && errCode && errCode !== -3 && (isMain || uri === request.url)) {
                    this._fetchUICleanup( win, abortAction );
                    reject(new Error(errMessage + ' ' + uri));
                }
            });

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
            if(browserWindow.webContents.debugger.isAttached()) {
                browserWindow.webContents.debugger.detach();
            }
            // unsubscribe events from session
            browserWindow.webContents.session.webRequest.onBeforeRequest(null);
            browserWindow.close();
        }
        browserWindow = null;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow request is send.
     */
    async onBeforeSendHeadersHandler( details ) {
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

        //
        if(details.requestHeaders['x-sec-fetch-dest']) {
            details.requestHeaders['Sec-Fetch-Dest'] = details.requestHeaders['x-sec-fetch-dest'];
        }
        delete details.requestHeaders['x-sec-fetch-dest'];

        //
        if(details.requestHeaders['x-sec-fetch-mode']) {
            details.requestHeaders['Sec-Fetch-Mode'] = details.requestHeaders['x-sec-fetch-mode'];
        }
        delete details.requestHeaders['x-sec-fetch-mode'];

        return details;
    }

    /**
     * Provide headers for the electron main process that shall be modified before every BrowserWindow response is received.
     */
    async onHeadersReceivedHandler( details ) {
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