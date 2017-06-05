const electron = require( 'electron' );

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
            webSecurity: true
        }
    });
    win.setMenu( null );

    // '../electron[.exe]' => host in development mode
    // '../hakuneko[.exe]' => host in distribution mode
    if( process.argv && process.argv.length > 0 && process.argv[0].match(/electron(?:\.exe)?$/) ) {
        // local served app
        win.loadURL( 'http://127.0.0.1:8081' );
        // open dev tools
        win.webContents.openDevTools();
    } else {
        // official distributed app
        win.loadURL( 'http://hakuneko.ovh' );
    }

    win.on( 'closed', () => {
        win = null;
    });
}

/**
 * Quit aplication, except for OSX
 */
function closeWindow () {
    if( process.platform !== 'darwin' ) {
        electron.app.quit();
    }
}

// connect events
electron.app.on( 'ready', activateWindow );
electron.app.on( 'activate', activateWindow );
electron.app.on( 'window-all-closed', closeWindow );
