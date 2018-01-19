const electron = require( 'electron' );
const path = require( 'path' );
const url = require( 'url' );
const config = require( './config.js' );
const cache = require( './cache.js' );

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





    electron.session.defaultSession.webRequest.onBeforeSendHeaders( ['http*://*'], ( details, callback ) => {
        // add Google Data Saver requires header or the request will be rejected
        let key = 'ac4500dd3b7579186c1b0620614fdb1f7d61f944';
        let ts = Math.floor( Date.now() / 1000 );
        let hash = require( 'crypto' ).createHash( 'md5' ).update( ts + key + ts ).digest( 'hex' );
        let rd = Math.floor( 999999 * Math.random() );
        details.requestHeaders['Chrome-Proxy'] = 'ps=' + [ ts, rd, Math.floor( 999999 * Math.random() ), Math.floor( 999999 * Math.random() ) ].join( '-' ) + ', sid=' + hash + ', b=3239, p=132, c=linux';
        details.requestHeaders['X-Forwarded-For'] = '123.123.123.123';
        console.log( 'REQ HEADERS', details.requestHeaders['Chrome-Proxy'] );
        callback( {
            cancel: false,
            requestHeaders: details.requestHeaders
        } );
    });




    if( config.app.developer ) {
        win.webContents.openDevTools();
    }

    cache.update( config.app.url.href, config.cache.directory, ( error ) => {
        win.loadURL( config.cache.url.href );
    });

    /**
     * Replace any existing event listener function registered by previous browser window that would be released when reloding page.
     * This prevents the "Attempting to call a function in a renderer window that has been closed or released" error.
     */
    win.webContents.on( 'devtools-reload-page', () => {
        //electron.session.defaultSession.webRequest.onBeforeSendHeaders( null, null );
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