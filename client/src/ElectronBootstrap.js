const path = require('path');
const electron = require('electron');
const { ConsoleLogger } = require('logtrine');

module.exports = class ElectronBootstrap {

    constructor(configuration, logger) {
        this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
        this._configuration = configuration;
        this._window = null;
        this._schemes = [
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
        ];
    }

    /**
     * 
     */
    launch() {
        // See: https://fossies.org/linux/electron/atom/browser/api/atom_api_protocol.cc
        // { standard, secure, bypassCSP, corsEnabled, supportFetchAPI, allowServiceWorkers }
        electron.protocol.registerSchemesAsPrivileged(this._schemes);

        // update userdata path (e.g. for portable version)
        electron.app.setPath('userData', this._configuration.applicationUserDataDirectory);

        return new Promise(resolve => {
            electron.app.on('ready', () => {
                this._registerCacheProtocol();
                this._createWindow();
                resolve();
            });
            electron.app.on('activate',  this._createWindow.bind(this));
            electron.app.on('window-all-closed',  this._allWindowsClosedHandler.bind(this));
            electron.app.on('certificate-error', this._certificateErrorHandler.bind(this));
            electron.app.on('browser-window-focus', this._registerHotkeys.bind(this));
            electron.app.on('browser-window-blur', this._unregisterHotkeys.bind(this));
        });
    }

    /**
     * 
     */
    _registerCacheProtocol() {
        electron.protocol.registerFileProtocol(this._configuration.applicationProtocol, (request, callback) => {
            let sub = path.normalize(new URL(request.url).pathname);
            let response = path.join(this._configuration.applicationCacheDirectory, sub);
            callback(response);
        } );
    }

    /**
     * Ignore any certificate errors, such as self-signed, expiration, ...
     */
    _certificateErrorHandler(event, webContents, url, error, certificate, callback) {
        event.preventDefault();
        callback(true);
    }

    /**
     * 
     */
    _registerHotkeys() {
        electron.globalShortcut.register('F11', this._toggleFullscreen.bind(this));
    }

    /**
     * 
     */
    _unregisterHotkeys() {
        electron.globalShortcut.unregister('F11');
    }

    /**
     * 
     */
    _toggleFullscreen() {
        this._window.setFullScreen(!this._window.isFullScreen());
    }

    /**
     * 
     */
    _allWindowsClosedHandler() {
        electron.app.quit();
    }

    /**
     * 
     */
    _createWindow() {
        if(this._window) {
            return;
        }

        electron.Menu.setApplicationMenu(null);

        this._window = new electron.BrowserWindow({
            width: 1120,
            height: 680,
            title: 'HakuNeko',
            show: false,
            backgroundColor: '#f8f8f8',
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true,
                webSecurity: false // required to open local images in browser
            }
        });

        this._setupBeforeSendHeaders();
        this._setupHeadersReceived();
        this._window.once('ready-to-show', () => this._window.show());
        this._window.on('closed', this._mainWindowClosedHandler.bind(this));
    }

    /**
     * 
     * @param {string} uri 
     * @returns {Promise}
     */
    loadURL(uri) {
        return this._window.loadURL(uri);
    }

    /**
     * 
     * @param {string} html 
     * @returns {Promise}
     */
    loadHTML(html) {
        let dataURL = 'data:text/html;charset=utf-8;base64,' + Buffer.from(html).toString('base64');
        return this._window.loadURL(dataURL);
    }

    /**
     * 
     */
    _mainWindowClosedHandler() {
        // close all existing windows
        electron.BrowserWindow.getAllWindows().forEach(window => window.close());
        this._window = null;
    }

    /**
     * 
     */
    _setupBeforeSendHeaders() {
        // inject headers before a request is made (call the handler in the webapp to do the dirty work)
        electron.session.defaultSession.webRequest.onBeforeSendHeaders(['http*://*'], async (details, callback) => {
            try {
                // prevent from injecting javascript into the webpage while the webcontent is not yet ready
                // => required for loading initial page over http protocol (e.g. local hosted test page)
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function which returns data
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    let result = await this._window.webContents.executeJavaScript(`Engine.Request.onBeforeSendHeadersHandler('${payload}');`);
                    callback({
                        cancel: false,
                        requestHeaders: result.requestHeaders
                    });
                } else {
                    throw new Error('Cannot inject javascript while web-application is not yet ready!');
                }
            } catch(error) {
                this._logger.warn(error);
                callback({
                    cancel: false,
                    requestHeaders: details.requestHeaders
                });
            }
        });
    }
    
    /**
     * 
     */
    _setupHeadersReceived() {
        electron.session.defaultSession.webRequest.onHeadersReceived(['http*://*'], async (details, callback) => {
            try {
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    // inject javascript: looks stupid, but is a working solution to call a function which returns data
                    // directly within the render process (without dealing with ipcRenderer)
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    let result = await this._window.webContents.executeJavaScript(`Engine.Request.onHeadersReceivedHandler('${payload}');`);
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
        });
    }
}