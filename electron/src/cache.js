const fs = require( 'fs' );
const path = require( 'path' );
const jszip = require( 'jszip' );
const url = require( 'url' );
const request = require( 'request' );
const crypto = require( 'crypto' );
const config = require( './config' );

var cache = {};

/**
 * 
 * @param {*} directory 
 */
function deleteFileEntry( entry ) {
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
}

/**
 * Helper function to recursively create all non-existing folders of the given path.
 */
function createDirectoryChain( directory ) {
    if( fs.existsSync( directory ) || directory === path.parse( directory ).root ) {
        return;
    }
    createDirectoryChain( path.dirname( directory ) );
    fs.mkdirSync( directory, '0755', true );
}

/**
 * 
 * @param {*} archiveData 
 * @param {*} ouputDirectory 
 */
function extractArchive( archiveData, ouputDirectory, callback ) {
    let zip = new jszip();
    zip.loadAsync( archiveData, {} ).then( ( unzip ) => {
        deleteFileEntry( ouputDirectory );
        let promises = [];
        unzip.forEach( ( name, entry ) => {
            promises.push( new Promise( ( resolve, reject ) => {
                name = path.join( ouputDirectory, name );
                if( entry.dir ) {
                    createDirectoryChain( name );
                    resolve();
                } else {
                    createDirectoryChain( path.dirname( name ) );
                    entry.async( 'uint8array' ).then( ( data ) => {
                        fs.writeFile( name, data, function( error ) {
                            if( error ) {
                                reject( error );
                            } else {
                                resolve();
                            }
                        });
                    }).catch( ( error ) => {
                        reject( error );
                    });
                }
            }));
        });
        Promise.all( promises ).then( (data ) => {
            callback( null );
        }).catch( ( error ) => {
            callback( error );
        });
    }).catch( ( error ) => {
        callback( error );
    });
}

/**
 * 
 * @param {string} appVersionFile - 
 * @param {string} cacheVersionFile - 
 * @param {cache~updateRequiredCallback} callback 
 */
function updateRequired( appVersionFile, cacheVersionFile, callback ) {
    // get latest version from web
    request.get( appVersionFile, ( error, response, content ) => {
        if( !error && response.statusCode === 200 ) {
            let appVersion = content.substring( 0, 6 );
            // get current version from cache
            fs.readFile( cacheVersionFile, 'utf8', ( error, data ) => {
                if( error || appVersion !== data.trim() ) {
                    callback( null, appVersion, url.resolve( appVersionFile, content ) );
                } else {
                    callback( new Error( 'Cached revision is already the same as the online revision' ), undefined, undefined );
                }
            });
        } else {
            callback( error, undefined, undefined );
        }
    });
}

/**
 * 
 * @param {*} revision 
 * @param {*} callback 
 */
function getArchive( appArchiveFileURL, callback ) {
    request.get( { url: appArchiveFileURL, encoding: null }, ( error, response, archive ) => {
        if( !error && response.statusCode === 200 ) {
            callback( null, archive );
        } else {
            callback( error, undefined );
        }
    });
};

/**
 * Download latest version of the web app and store to the local application cache
 * @param {string} appArchiveURL - URL where the archive, public key and signature are stored (must have a trailing slash).
 * @param {string} cacheDirectory - Directory where the web app is installed locally.
 * @param {*} callback Function that will be executed after the update process is complete.
 */
cache.update = ( appArchiveURL, cacheDirectory, callback ) => {
    // never update when in developer mode
    if( config.app.developer ) {
        callback( /*new Error( 'Update prohibited while in developer mode' )*/ null );
        return;
    }
    let cacheVersionFile = path.join( cacheDirectory, 'version' );
    //
    updateRequired( appArchiveURL, cacheVersionFile, ( error, archiveVersion, archiveURL ) => {
        //
        if( !error && archiveURL ) {
            getArchive( archiveURL, ( error, archive ) => {
                if( !error && archive ) {
                    let signature = url.parse( archiveURL, true ).query.signature;
                    let verify = crypto.createVerify( 'RSA-SHA256' );
                    verify.update( archive );
                    if( verify.verify( config.app.key, Buffer.from( signature, 'hex' ) ) ) {
                        extractArchive( archive, cacheDirectory, ( error ) => {
                            if( !error ) {
                                fs.writeFileSync( cacheVersionFile, archiveVersion );
                            }
                            callback( error );
                        });
                    } else {
                        callback( new Error( 'Application archive on server has invalid signature: ' + signature ) );
                    }
                } else {
                    callback( error );
                }
            });
        } else {
            callback( error );
        }
    });
}

module.exports = cache;