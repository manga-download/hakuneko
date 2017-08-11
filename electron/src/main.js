const electron = require( 'electron' );
const path = require( 'path' );

// set portable mode e.g. for path locations
var portable = false;
// global reference to the main window
var win = null;

/**
 *
 */
function activateWindow() {

    if ( win !== null ) {
        return;
    }

    win = new electron.BrowserWindow( {
        width: 1120,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false // required to open local images in browser
        }
    });
    win.setMenu( null );

    // '../electron[.exe]' => host in development mode
    // '../hakuneko[.exe]' => host in distribution mode
    if( process.argv && process.argv.length > 0 && process.argv[0].match(/electron(?:\.exe)?$/i) ) {
        // local served app
        win.loadURL( 'http://127.0.0.1:8081' );
        // open dev tools
        win.webContents.openDevTools();
    } else {
        // official distributed app
        win.loadURL( 'http://hakuneko.ovh' );
    }

    /**
     * Replace any existing event listener function registered by previous browser window that would be released when reloding page.
     * This prevents the "Attempting to call a function in a renderer window that has been closed or released" error.
     */
    win.webContents.on( 'devtools-reload-page', ( e ) => {
        electron.session.defaultSession.webRequest.onBeforeSendHeaders( [], ( details, callback ) => {
            callback({
                cancel: false
            });
        });
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

// change userdata path for portable version
if( portable ) {
    electron.app.setPath( 'userData', path.join( path.dirname( electron.app.getPath( 'exe' ) ), 'userdata' ) );
}

// connect events
electron.app.on( 'ready', activateWindow );
electron.app.on( 'activate', activateWindow );
electron.app.on( 'window-all-closed', closeWindow );