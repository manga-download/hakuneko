const electron = require('electron');
const { ConsoleLogger } = require('logtrine');

module.exports = class ElectronBootstrap {

    constructor(configuration, logger) {
        this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
        this._configuration = configuration;
        this._window = null;
    }

    initialize() {
        // register new protocol handler as standard handler to host files locally without web server
        // see: https://fossies.org/linux/electron/atom/browser/api/atom_api_protocol.cc
        // => required to enable access to chromium specific features such as local store, indexedDB, ...
        // { standard, secure, bypassCSP, corsEnabled, supportFetchAPI, allowServiceWorkers }
        electron.protocol.registerSchemesAsPrivileged( [
            {
                scheme: this._configuration.applicationProtocol,
                privileges: {
                    standard: true
                }
            },
            {
                scheme: this._configuration.connectorProtocol,
                privileges: {
                    standard: true,
                    supportFetchAPI: true
                }
            }
        ] );

        // update userdata path (e.g. for portable version)
        electron.app.setPath('userData', this._configuration.applicationUserDataDirectory);

        //electron.app.addEventListener(...);
        electron.app.on('ready', this._registerCacheProtocol);
        electron.app.on('ready', this._showWindow /* TODO: Bind this? */);
        electron.app.on('activate',  this._showWindow);
        electron.app.on('window-all-closed',  this._allWindowsClosedHandler);

        // ignore certificate errors (e.g. invalid date)
        electron.app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
            event.preventDefault();
            callback(true);
        });

        electron.app.on('browser-window-blur', () => electron.globalShortcut.unregister('F11'));
        electron.app.on('browser-window-focus', () => electron.globalShortcut.register('F11', () => win.setFullScreen(!win.isFullScreen())));
    }

    _registerCacheProtocol() {
        electron.protocol.registerFileProtocol(this._configuration.applicationProtocol, (request, callback) => {
            callback({ path: path.normalize(path.join(this._configuration.applicationCacheDirectory, new URL(request.url).pathname)) });
        } );
    }

    _setupBeforeSendHeaders() {
        // inject headers before a request is made (call the handler in the webapp to do the dirty work)
        electron.session.defaultSession.webRequest.onBeforeSendHeaders(['http*://*'], async (details, callback) => {
            try {
                // prevent from injecting javascript into the webpage while the webcontent is not yet ready
                // => required for loading initial page over http protocol (e.g. local hosted test page)
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    await this._window.webContents.executeJavaScript(`Engine.Request.onBeforeSendHeadersHandler('${payload}');`);
                    callback({
                        cancel: false,
                        requestHeaders: result.requestHeaders
                    });
                } else {
                    throw new Error('Cannot inject javascript while web-application is not yet ready!');
                }
            } catch(error) {
                this._logger.warn(error);
                //console.warn( error );
                callback({
                    cancel: false,
                    requestHeaders: details.requestHeaders
                });
            }

            /*
            Promise.resolve()
            .then(() => {
                // prevent from injecting javascript into the webpage while the webcontent is not yet ready
                // => required for loading initial page over http protocol (e.g. local hosted test page)
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    return this._window.webContents.executeJavaScript(`Engine.Request.onBeforeSendHeadersHandler('${payload}');`);
                } else {
                    throw new Error('Cannot inject javascript while web-application is not yet ready!');
                }
            } )
            .then(result => {
                callback({
                    cancel: false,
                    requestHeaders: result.requestHeaders
                });
            } )
            .catch(error => {
                this._logger.warn(error);
                //console.warn( error );
                callback({
                    cancel: false,
                    requestHeaders: details.requestHeaders
                });
            });
            */
        });
    }
    
    _setupHeadersReceived() {
        electron.session.defaultSession.webRequest.onHeadersReceived(['http*://*'], async (details, callback) => {
            try {
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    await this._window.webContents.executeJavaScript(`Engine.Request.onHeadersReceivedHandler('${payload}');`);
                    callback({
                        cancel: false,
                        responseHeaders: result.responseHeaders
                        // statusLine
                    });
                } else {
                    throw new Error('Cannot inject javascript while web-application is not yet ready!');
                }
            } catch(error) {
                this._logger.warn(error);
                callback({
                    cancel: false,
                    responseHeaders: details.responseHeaders
                    // statusLine
                });
            }

            /*
            Promise.resolve()
            .then(() => {
                // prevent from injecting javascript into the webpage while the webcontent is not yet ready
                // => required for loading initial page over http protocol (e.g. local hosted test page)
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    return this._window.webContents.executeJavaScript(`Engine.Request.onHeadersReceivedHandler('${payload}');`);
                } else {
                    throw new Error('Cannot inject javascript while web-application is not yet ready!');
                }
            } )
            .then(result => {
                callback({
                    cancel: false,
                    responseHeaders: result.responseHeaders
                    // statusLine
                });
            })
            .catch(error => {
                this._logger.warn(error);
                callback({
                    cancel: false,
                    responseHeaders: details.responseHeaders
                    // statusLine
                });
            });
            */
        });
    }

    _showWindow() {
        //

        // ...


        this._window.on('closed', this._mainWindowClosedHandler);
    }

    _mainWindowClosedHandler() {
        // close all existing windows
        electron.BrowserWindow.getAllWindows().forEach(window => window.close());
        this._window = null;
    }

    _allWindowsClosedHandler() {
        electron.app.quit();
    }
}