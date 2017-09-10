const electron = require( 'electron' );
const path = require( 'path' );
const url = require( 'url' );

// indicate whether the settings should be saved in the application directory or in the user directory
var portable = false;
// online repository where the latest version of the app is stored
var appURL = 'http://hakuneko.ovh/app.tar';
// app url that will be opened in electron on startup
var cacheURL = 'cache://hakuneko/index.html';
// relative path to the web app directory in the development directory
var devDirectory = '../../web';

/**
 * Create url object from a given uri string
 * @param {*} href 
 */
function getURL( href ) {
    let result = url.parse( href );
    // remove trailing period from protocol property
    result.protocol = result.protocol.slice( 0, -1 );
    return result;
}

/**
 * Determine whether the application was started in a development environment or not
 */
function getDeveloperMode() {
    return ( process.argv && process.argv.length > 0 && process.argv[0].match(/electron(?:\.exe)?$/i) !== null );
}

/**
 * Get the path to the directory where the user data should be stored (depends on global portable variable)
 */
function getUserData() {
    if( portable ) {
        return path.join( path.dirname( electron.app.getPath( 'exe' ) ), 'userdata' );
    } else {
        return electron.app.getPath( 'userData' );
    }
}

/**
 * Get the path to the directory where the web application is stored (locally)
 */
function getCacheDirectory() {
    if( getDeveloperMode() ) {
        return path.normalize( path.join( electron.app.getAppPath(), devDirectory ) );
    }
    if( portable ) {
        return path.join( path.dirname( electron.app.getPath( 'exe' ) ), 'cache' );
    }
    return electron.app.getPath( 'userCache' );
}

/**
 * Export the configuration module
 */
module.exports = {
    app: {
        developer: getDeveloperMode(),
        userdata: getUserData(),
        url: getURL( appURL )
    },
    cache: {
        url: getURL( cacheURL ),
        directory: getCacheDirectory()
    }
};