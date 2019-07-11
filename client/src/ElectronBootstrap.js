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
    prepare() {
        // See: https://fossies.org/linux/electron/atom/browser/api/atom_api_protocol.cc
        // { standard, secure, bypassCSP, corsEnabled, supportFetchAPI, allowServiceWorkers }
        electron.protocol.registerSchemesAsPrivileged(this._schemes);

        // update userdata path (e.g. for portable version)
        electron.app.setPath('userData', this._configuration.applicationUserDataDirectory);

        electron.app.on('ready', this._registerCacheProtocol.bind(this));
        electron.app.on('ready', this._showWindow.bind(this));
        electron.app.on('activate',  this._showWindow.bind(this));
        electron.app.on('window-all-closed',  this._allWindowsClosedHandler.bind(this));
        // ignore certificate errors (e.g. invalid date)
        electron.app.on('certificate-error', this._certificateErrorHandler.bind(this));
        // use certain hotkeys
        electron.app.on('browser-window-focus', this._registerHotkeys.bind(this));
        electron.app.on('browser-window-blur', this._unregisterHotkeys.bind(this));
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
     * 
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
    _showWindow() {
        if(this._window) {
            return;
        }
    
        this._window = new electron.BrowserWindow({
            width: 1120,
            height: 680,
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true,
                webSecurity: false // required to open local images in browser
            }
        });

        this._setupBeforeSendHeaders();
        this._setupHeadersReceived();
        this._window.setTitle('HakuNeko');
        this._window.setMenu(null);
        this._window.loadURL(this._configuration.applicationStartupURL);
        this._window.on('closed', this._mainWindowClosedHandler.bind(this));
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
    _setupProxyServer() {
        return new Promise(resolve => {
            this._window.webContents.session.setProxy({
                proxyRules: 'socks5://bar.com' // this._configuration.proxyRules
            }, () => resolve());
        });
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
                    // inject javascript: looks stupid, but is a working solution to call a function
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
                //console.warn( error );
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
                    // inject javascript: looks stupid, but is a working solution to call a function
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