const fs = require( 'fs' );
const path = require( 'path' );
const jszip = require( 'jszip' );
const url = require( 'url' );
const http = require( 'http' );
const crypto = require( 'crypto' );
const config = require( './config' );

var cache = {};

/**
 * Helper function to delete a file or directory with all its content.
 * @param {*} entry 
 */
function deleteFileEntry( entry ) {
    // TODO: rewrite to async ...
    try {
        if( fs.existsSync( entry ) ) {
            let info = fs.lstatSync( entry );
            if( info.isDirectory() ) {
                let children = fs.readdirSync( entry );
                for( let child of children ) {
                    deleteFileEntry( path.join( entry, child ) )
                }
                fs.rmdirSync( entry );
            }
            if( info.isFile() ) {
                fs.unlinkSync( entry );
            }
        }
        console.log( 'Deleted:', entry );
        return Promise.resolve();
    } catch( error ) {
        return Promise.reject( error );
    }
}

/**
 * Helper function to recursively create all non-existing folders of the given path.
 * @param {*} directory 
 */
function createDirectoryChain( directory ) {
    // TODO: rewrite to async ...
    try {
        if( fs.existsSync( directory ) || directory === path.parse( directory ).root ) {
            return;
        }
        createDirectoryChain( path.dirname( directory ) );
        fs.mkdirSync( directory, '0755', true );
        console.log( 'Created:', directory );
        return Promise.resolve();
    } catch( error ) {
        return Promise.reject( error );
    }
}

/**
 * Helper function to write the given data to the given file.
 * Simple promise wrapper for callback based writeFile() in fs module.
 * @param {} file 
 * @param {*} data 
 */
function writeFile( file, data ) {
    return new Promise( ( resolve, reject ) => {
        fs.writeFile( file, data, error => {
            if( error ) {
                reject( error );
            } else {
                console.log( 'Extracted:', file );
                resolve( file );
            }
        } );
    } );
}

/**
 * Extract an entry from an archive to the given directory
 * and resolve a promise with the path to the extracted file.
 * @param {*} archive 
 * @param {*} directory 
 * @param {*} entry 
 */
function extractZipEntry( archive, directory, entry ) {
    let file = path.join( directory, entry );
    if( archive.files[entry].dir ) {
        return createDirectoryChain( file );
    } else {
        return archive.files[entry].async( 'uint8array' )
        .then( data => writeFile( file, data ) );
    }
}

/**
 * Extract the files from a raw archive buffer to the given directory.
 * @param {*} buffer 
 * @param {*} directory 
 */
function extractArchive( buffer, directory ) {
    let zip = new jszip();
    return zip.loadAsync( buffer, {} )
    .then( archive => {
        return deleteFileEntry( directory )
        .then( () => Promise.resolve( archive ) );
    } )
    .then( archive => {
        let promises = Object.keys( archive.files ).map( entry => extractZipEntry( archive, directory, entry ) );
        return Promise.all( promises );
    } );
}

/**
 * Download content via HTTP.
 * @param {*} options 
 */
function request( options ) {
    return new Promise( ( resolve, reject ) => {
        let request = http.request( options, response => {
            if( response.statusCode !== 200 ) {
                reject( new Error( 'Status: ' + response.statusCode ) );
            }
            let data = [];
            //response.setEncoding( 'utf8' );
            response.on( 'data', chunk => data.push( chunk ) );
            response.on( 'end', () => resolve( Buffer.concat( data ) ) );
        } );
        request.on( 'error', error => reject( error ) );
        //request.write( /* REQUEST BODY */ );
        request.end();
    } );
}

/**
 * Get the version of the currently installed HakuNeko web-app.
 * @param {*} file 
 */
function getLocalVersionNumber( file ) {
    return new Promise( ( resolve, reject ) => {
        fs.readFile( file, 'utf8', ( error, data ) => {
            if( error ) {
                resolve( undefined );
            } else {
                resolve( data.trim() );
            }
        } );
    } );
}

/**
 * Get the info for the latest available update of the HakuNeko web-app.
 * @param {*} uri 
 */
function getRemoteUpdateInfo( uri ) {
    return request( uri )
    .then( data => {
        let link = data.toString( 'utf8' );
        let update = {
            version: link.substring( 0, 6 ),
            signature: url.parse( link, true ).query.signature,
            link: url.resolve( uri, link )
        }
        return Promise.resolve( update );
    } );
}

/**
 * Download the latest version of the HakuNeko web-app.
 * @param {string} updateURL - URL containing the latest update info.
 * @param {string} cacheDirectory - Directory where the web-app is installed locally.
 */
cache.update = ( updateURL, cacheDirectory ) => {

    if( config.app.developer ) {
        return Promise.reject( 'Automatic updates are disabled when in developer mode!' );
    }

    let cacheVersionFile = path.join( cacheDirectory, 'version' );
    console.log( 'Checking for update:', updateURL );
    return getLocalVersionNumber( cacheVersionFile )
    .then( version => {
        console.log( 'Local revision:', version );
        return getRemoteUpdateInfo( updateURL )
        .then( update => {
            console.log( 'Remote revision:', update.version );
            if( update.version === version ) {
                return Promise.reject( null );
            } else {
                return Promise.resolve( update );
            }
        } )
    } )
    .then( update => {
        console.log( 'Updating...' );
        return request( update.link )
        .then( data => {
            let validator = crypto.createVerify( 'RSA-SHA256' );
            validator.update( data );
            if( !validator.verify( config.app.key, Buffer.from( update.signature, 'hex' ) ) ) {
                throw new Error( 'Integrity check of update failed! The signature does not match the update package.' );
            } else {
                return extractArchive( data, cacheDirectory )
                .then( () => Promise.resolve( update.version ) );
            }
        } );
    } )
    .then( version => {
        console.log( 'Update complete' );
        return new Promise( ( resolve, reject ) => {
            fs.writeFile( cacheVersionFile, version, error => {
                if( error ) {
                    reject( error );
                } else {
                    resolve( version );
                }
            } );
        } );
    } );
}

module.exports = cache;