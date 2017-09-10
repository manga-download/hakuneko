const electron = require( 'electron' );
const path = require( 'path' );
const url = require( 'url' );
const config = require( './config.js' );

// global reference to the main window
var win = null;

/**
 * Register a custom file protocol handler that will open files from the given directory
 * @param {*} protocol 
 * @param {*} directory 
 */
function registerCacheProtocol( protocol, directory ) {
    electron.protocol.registerFileProtocol( protocol, ( request, callback ) => {
        // build full path (replace backslashes by forward slashes)
        callback( { path: path.normalize( path.join( directory, url.parse( request.url ).pathname ) ) } );
    });
}

/**
 * Open and configure the main window of the application
 */
function activateWindow() {

    if ( win !== null ) {
        return;
    }

    registerCacheProtocol( config.cache.url.protocol, config.cache.directory );

    win = new electron.BrowserWindow( {
        width: 1120,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false // required to open local images in browser
        }
    });

    win.setMenu( null );

    if( config.app.developer ) {
        win.webContents.openDevTools();
    }

    win.loadURL( config.cache.url.href );
    //win.loadURL( 'http://127.0.0.1:8081' );
    //win.loadURL( 'http://hakuneko.ovh:80' );

    /**
     * Replace any existing event listener function registered by previous browser window that would be released when reloding page.
     * This prevents the "Attempting to call a function in a renderer window that has been closed or released" error.
     */
    win.webContents.on( 'devtools-reload-page', () => {
        electron.session.defaultSession.webRequest.onBeforeSendHeaders( null, null );
    });

    win.on( 'closed', () => {
        win = null;
    });
}

/**
 * Quit aplication, except for OSX
 */
function closeWindow () {
    //if( process.platform !== 'darwin' ) {
        electron.app.quit();
    //}
}

/************************
 *** MAIN ENTRY POINT ***
 ************************/

// register new protocol handler as standard handler to host files locally without web server
// => required to enable access to chromium specific features such as local store, indexedDB, ...
electron.protocol.registerStandardSchemes( [config.cache.url.protocol] );

// update userdata path (e.g. for portable version)
electron.app.setPath( 'userData', config.app.userdata );

// connect events
//electron.app.addEventListener(;
electron.app.on( 'ready', activateWindow );
electron.app.on( 'activate', activateWindow );
electron.app.on( 'window-all-closed', closeWindow );