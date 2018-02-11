const electron = require( 'electron' );
const path = require( 'path' );
const url = require( 'url' );
const args = require( './args.js' );

// indicate whether the settings should be saved in the application directory or in the user directory
var portable = false;
// indicate whether the application was started in development environment or production mode (detected by name of the executable)
var developer = ( process.argv && process.argv.length > 0 && process.argv[0].match(/electron(?:\.exe)?$/i) !== null );
// url with tests that should be run (hakuneko will ne started in test mode when test !== undefined)
var testURL = args.getArg( '-t', '--test' );
// online repository where the latest version of the app is stored
var appURL = args.getArg( '-u', '--url' ) || 'http://static.hakuneko.download/0.3/latest';
// app url that will be opened in electron on startup
var cacheURL = 'cache://hakuneko/index.html';
// relative path to the web app directory in the development directory
var devDirectory = '../../web';
// public key to verify signature of web-app
var pubkey =
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzx5ZZjtNPDbf/iGqdjQj
FyCSIWF4dXDiRUWVga7yBBMJOOEidBDlHeAhQXj64f+IrXCxu+/ySNRgXTYp/1I7
S0HJsgcRz9AlzUVm6jeBZbFs42ggxVOxPA8RQDcEZFU/YDPQuYmz82euhI8VqDoZ
VlHmFOUICTgp7GvNNK94KDxx3H0qX9kv1U3tQEdxb9FFH5kzg4dR5/5WSriFFMNS
QDVrm5yAaEfty75u2Os1hobY9r5ACHpaoxitPBUNgqX7lORseb3t+dfoDVhowTXy
P0xJDQn8Kz3JTmVUjPnZO+JFcvVjtYU2x+i0ab/qfTDSB5W62HUFQZ40EUTXeNN3
owIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Create url object from a given uri string
 * @param {*} href 
 */
function getURL( href ) {
    let result = url.parse( href );
    // remove trailing colon from protocol property
    result.protocol = result.protocol.slice( 0, -1 );
    return result;
}

/**
 * Get the path to the directory where the user data should be stored (depends on global portable variable)
 */
function getUserData() {
    if( developer ) {
        //
    }
    if( portable ) {
        return path.join( path.dirname( electron.app.getPath( 'exe' ) ), 'userdata' );
        //return path.normalize( path.join( electron.app.getAppPath(), '../../userdata' ) );
    }
    return electron.app.getPath( 'userData' );
}

/**
 * Get the path to the directory where the web application is stored (locally)
 */
function getCacheDirectory() {
    if( developer ) {
        return path.normalize( path.join( electron.app.getAppPath(), devDirectory ) );
    }
    if( portable ) {
        return path.join( path.dirname( electron.app.getPath( 'exe' ) ), 'cache' );
        //return path.normalize( path.join( electron.app.getAppPath(), '../../cache' ) );
    }

    if( process.platform == 'win32' ) {
        // even if this data is for all users => store for each user because of required write permission for updates
        return path.normalize( path.join( electron.app.getPath( 'appData' ), '../Local/hakuneko-desktop/cache' ) ); // => ~\AppData\Local\hakuneko-desktop\cache
    }
    if( process.platform == 'darwin' ) {
        // even if this data is for all users => store for each user because of required write permission for updates
        return electron.app.getPath( 'userCache' ); // => ~/Library/Caches/hakuneko-desktop
    }
    if( process.platform == 'linux' ) {
        // even if this data is for all users => store for each user because of required write permission for updates
        return electron.app.getPath( 'userCache' ); // => ~/.cache/hakuneko-desktop
    }
}

/**
 * Export the configuration module
 */
module.exports = {
    app: {
        developer: developer,
        userdata: getUserData(),
        url: getURL( appURL ),
        key: pubkey
    },
    cache: {
        url: ( testURL ? getURL( testURL ) : getURL( cacheURL )), // ( <is online> ? getURL( appURL ) : getURL( cacheURL ) ),
        directory: getCacheDirectory()
    }
};