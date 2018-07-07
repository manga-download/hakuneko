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
            experimentalFeatures: true,
            nodeIntegration: true,
            webSecurity: false // required to open local images in browser
        }
    } );

    // inject headers before a request is made (call the handler in the webapp to do the dirty work)
    electron.session.defaultSession.webRequest.onBeforeSendHeaders( ['http*://*'], ( details, callback ) => {
        // prevent from injecting javascript into the webpage while the webcontent is not yet ready
        // => required for loading initial page over http protocol (e.g. local hosted test page)
        if( win && win.webContents && !win.webContents.isLoading() ) {
            // inject javascript: looks stupid, but is a working solution to call a function
            // directly within the render process (without dealing with ipcRenderer)
            let payload = Buffer.from( JSON.stringify( details ) ).toString( 'base64' );
            win.webContents.executeJavaScript( `Engine.Request.onBeforeSendHeadersHandler('${payload}');` )
            .then( result => {
                callback( {
                    cancel: false,
                    requestHeaders: result.requestHeaders
                } );
            } )
            .catch( error => {
                callback( {
                    cancel: false,
                    requestHeaders: details.requestHeaders
                } );
            } );
        } else {
            callback( {
                cancel: false,
                requestHeaders: details.requestHeaders
            } );
        }
    } );
    
    win.setMenu( null );

    let load = () => {
        win.loadURL( config.cache.url.href );
        if( config.app.developer ) {
            win.webContents.openDevTools();
        }
    };

    cache.update( config.app.url.href, config.cache.directory )
    .then( version => {
        load();
        electron.dialog.showMessageBox( win, {
            type: 'info',
            message: 'HakuNeko has been updated\nrev.' + version,
            buttons: ['OK']
        }, ( button, checkbox ) => {} );
    } )
    .catch( error => {
        load();
        if( error ) {
            console.error( error );
        }
    } );

    win.on( 'closed', () => {
        // close all existing windows
        electron.BrowserWindow.getAllWindows().forEach( ( w ) => { w.close(); });
        win = null;
    } );
}

/**
 * Quit aplication, except for OSX
 */
function closeWindow () {
    electron.app.quit();
}

/************************
 *** MAIN ENTRY POINT ***
 ************************/

// Disabling GPU acceleration to possibly prevent chromiums 'blank screen' bug
electron.app.disableHardwareAcceleration();

// add HakuNeko's application directory to the environment variable path (make ffmpeg available on windows)
process.env.PATH += ( process.platform === 'win32' ? ';' : ':' ) + path.dirname( process.execPath );

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