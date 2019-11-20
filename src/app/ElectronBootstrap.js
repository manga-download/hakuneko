const path = require('path');
const fs = require('fs-extra');
const electron = require('electron');
const { ConsoleLogger } = require('@logtrine/logtrine');
const urlFilterAll = { urls: ['http://*/*', 'https://*/*'] };
const trayTooltipMinimize = 'HakuNeko\nClick to hide window';
const trayTooltipRestore = 'HakuNeko\nClick to show window';

module.exports = class ElectronBootstrap {

    constructor(configuration, logger) {
        this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
        this._configuration = configuration;
        this._window = null;
        this._schemes = [
            {
                scheme: this._configuration.applicationProtocol,
                privileges: {
                    standard: true,
                    supportFetchAPI: true
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
        this._directoryMap = {
            'cache': this._configuration.applicationCacheDirectory,
            'plugins': this._configuration.applicationUserPluginsDirectory
        };
        this._appIcon;
        this._minimizeToTray = false; // only supported when tray is shown
        this._showTray = false;
        this._tray;
    }

    /**
     *
     */
    launch() {
        /*
         * See: https://fossies.org/linux/electron/atom/browser/api/atom_api_protocol.cc
         * { standard, secure, bypassCSP, corsEnabled, supportFetchAPI, allowServiceWorkers }
         */
        electron.protocol.registerSchemesAsPrivileged(this._schemes);

        // update userdata path (e.g. for portable version)
        electron.app.setPath('userData', this._configuration.applicationUserDataDirectory);

        /*
         * HACK: Create a dummy menu to support local hotkeys (only accessable when app is focused)
         *       This has to be done, because F12 key cannot be used as global key in windows
         */
        this._registerLocalHotkeys();

        return new Promise(resolve => {
            electron.app.on('ready', () => {
                this._appIcon = electron.nativeImage.createFromPath(path.join(this._configuration.applicationCacheDirectory, 'img', 'tray', process.platform === 'win32' ? 'logo.ico' : 'logo.png'));
                this._registerCacheProtocol();
                this._createWindow();
                resolve();
            });
            /*
             * HACK: prevent default in main process, because it cannot be done in render process:
             *       see: https://github.com/electron/electron/issues/9428#issuecomment-300669586
             */
            electron.app.on('login', evt => evt.preventDefault());
            electron.app.on('activate', this._createWindow.bind(this));
            electron.app.on('window-all-closed', this._allWindowsClosedHandler.bind(this));
            electron.app.on('certificate-error', this._certificateErrorHandler.bind(this));
        });
    }

    /**
     *
     */
    _registerCacheProtocol() {
        electron.protocol.registerBufferProtocol(this._configuration.applicationProtocol, async (request, callback) => {
            try {
                let uri = new URL(request.url);
                let endpoint = path.join(this._directoryMap[uri.hostname], path.normalize(uri.pathname));
                if(!await fs.exists(endpoint)) {
                    throw -6; // https://cs.chromium.org/chromium/src/net/base/net_error_list.h
                }
                let stats = await fs.stat(endpoint);
                let mime;
                let buffer;
                if(stats.isDirectory()) {
                    mime = 'application/json';
                    buffer = Buffer.from(JSON.stringify(await fs.readdir(endpoint)));
                }
                if(stats.isFile()) {
                    mime = endpoint.endsWith('.mjs') ? 'text/javascript' : '';
                    buffer = await fs.readFile(endpoint);
                }
                callback({
                    mimeType: mime, // leaving this blank seems to use autodetect
                    data: buffer
                });
            } catch(error) {
                callback(error);
            }
        });
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
    _registerLocalHotkeys() {
        let menu = [
            {
                role: 'viewMenu',
                submenu: [
                    { role: 'togglefullscreen' },
                    {
                        role: 'toggleDevTools',
                        accelerator: 'F12'
                    },
                ]
            },
            {
                role: 'editMenu',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'selectall' },
                    { type: 'separator' },
                    {
                        label: 'Copy URL',
                        accelerator: 'Shift+C',
                        click: this._copyURL.bind(this)
                    },
                    {
                        label: 'Paste URL',
                        accelerator: 'Shift+V',
                        click: this._pasteURL.bind(this)
                    }
                ]
            }
        ];
        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu));
    }

    /**
     *
     */
    _copyURL(menu, window) {
        if(window !== this._window) {
            electron.clipboard.writeText(window.webContents.getURL());
        }
    }

    /**
     *
     */
    _pasteURL(menu, window) {
        if(window !== this._window) {
            window.webContents.loadURL(electron.clipboard.readText());
        }
    }

    /**
     *
     */
    _allWindowsClosedHandler() {
        electron.app.quit();
    }

    /**
     *
     * @param {bool} showTray
     */
    _setupTray(showTray) {
        if(showTray) {
            let menu = [
                {
                    label: 'Minimize to Tray',
                    //enabled: true,
                    click: () => {
                        if(process.platform === 'darwin') {
                            electron.app.dock.hide();
                        }
                        this._window.hide();
                        //item.enabled = false;
                    }
                },
                {
                    label: 'Restore from Tray',
                    //enabled: false,
                    click: () => {
                        if(process.platform === 'darwin') {
                            electron.app.dock.show();
                        }
                        this._window.show();
                        //item.enabled = false;
                    }
                },
                {
                    role: 'quit',
                }
            ];
            this._tray = new electron.Tray(this._appIcon);
            this._tray.setContextMenu(electron.Menu.buildFromTemplate(menu));
        } else {
            this._tray = undefined;
        }
    }

    /**
     *
     */
    _createWindow() {
        if(this._window) {
            return;
        }

        this._window = new electron.BrowserWindow({
            width: 1120,
            height: 680,
            title: 'HakuNeko',
            icon: this._appIcon,
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
        this._setupTray(this._showTray);
        this._window.setMenuBarVisibility(false);
        this._window.once('ready-to-show', () => this._window.show());
        this._window.on('close', this._mainWindowCloseHandler.bind(this));
        this._window.on('closed', this._mainWindowClosedHandler.bind(this));
        this._window.on('restore', this._mainWindowRestoreHandler.bind(this));
        this._window.on('maximize', this._mainWindowRestoreHandler.bind(this));
        this._window.on('minimize', this._mainWindowMinimizeHandler.bind(this));
        electron.ipcMain.on('quit', this._mainWindowQuitHandler.bind(this));
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
     * @param {*} evt
     */
    _mainWindowCloseHandler(evt) {
        this._window.webContents.send('close');
        evt.preventDefault();
    }

    /**
     * Exit the application forcefully without raising the close event handler
     */
    _mainWindowQuitHandler() {
        this._tray && this._tray.destroy();
        /*
         * NOTE: removing a certain event handler seems not to work...
         *this._window.removeListener('close', this._mainWindowCloseHandler);
         */
        this._window.removeAllListeners('close');
        this._window.close();
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
    _mainWindowRestoreHandler() {
        if(this._tray && this._showTray) {
            this._tray.setToolTip(trayTooltipMinimize);
        }
    }

    /**
     *
     * @param {*} evt
     */
    _mainWindowMinimizeHandler(evt) {
        if(this._tray && this._showTray) {
            this._tray.setToolTip(trayTooltipRestore);
            if(this._minimizeToTray) {
                this._window.hide();
                evt.preventDefault();
            }
        }
    }

    /**
     *
     */
    _setupBeforeSendHeaders() {
        // inject headers before a request is made (call the handler in the webapp to do the dirty work)
        electron.session.defaultSession.webRequest.onBeforeSendHeaders(urlFilterAll, async (details, callback) => {
            try {
                /*
                 * prevent from injecting javascript into the webpage while the webcontent is not yet ready
                 * => required for loading initial page over http protocol (e.g. local hosted test page)
                 */
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    /*
                     * inject javascript: looks stupid, but is a working solution to call a function which returns data
                     * directly within the render process (without dealing with ipcRenderer)
                     */
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    let result = await this._window.webContents.executeJavaScript(`HakuNeko.Request.onBeforeSendHeadersHandler('${payload}');`);
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
        electron.session.defaultSession.webRequest.onHeadersReceived(urlFilterAll, async (details, callback) => {
            try {
                if(this._window && this._window.webContents && !this._window.webContents.isLoading()) {
                    /*
                     * inject javascript: looks stupid, but is a working solution to call a function which returns data
                     * directly within the render process (without dealing with ipcRenderer)
                     */
                    let payload = Buffer.from(JSON.stringify(details)).toString('base64');
                    let result = await this._window.webContents.executeJavaScript(`HakuNeko.Request.onHeadersReceivedHandler('${payload}');`);
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
};