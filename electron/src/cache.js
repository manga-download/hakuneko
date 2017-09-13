const fs = require( 'fs' );
const path = require( 'path' );
const jszip = require( 'jszip' );
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
        let promises = [];
        unzip.forEach( ( name, entry ) => {
            promises.push( new Promise( ( resolve, reject ) => {
            name = path.join( ouputDirectory, name );
                if( entry.dir ) {
                    createDirectoryChain( name );
                    console.log( 'DIR', name );
                    resolve();
                } else {
                    entry.async( 'uint8array' ).then( ( data ) => {
                        fs.writeFile( name, data, function( writingError ) {
                            if( writingError ) {
                                console.error( writingError );
                            }
                            console.log( 'FILE', name );
                            resolve();
                        });
                    });
                }
            }));
        });
        Promise.all( promises ).then( (values ) => {
            console.log( 'Extracting complete ...' );
            callback();
        });
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
    request.get(appVersionFile, ( error, response, content ) => {
        if( !error && response.statusCode === 200 ) {
            let appVersion = content.trim();
            // get current version from cache
            fs.readFile( cacheVersionFile, 'utf8', ( error, data ) => {
                if( error || appVersion !== data.trim() ) {
                    callback( appVersion );
                }
            });
        }
    });
}

/**
 * Download latest version of the web app and store to the local application cache
 * @param {string} appArchiveURL - URL where the archive, public key and signature are stored (must have a trailing slash).
 * @param {string} cacheDirectory - Directory where the web app is installed locally.
 * @param {*} callback Function that will be executed after the update process is complete.
 */
cache.update = ( appArchiveURL, cacheDirectory, callback ) => {
    //
    updateRequired( appArchiveURL + 'latest', path.join( cacheDirectory, 'version' ), ( revision ) => {
        //
        let getArchive = ( signature, callback ) => {
            request.get( { url: appArchiveURL + revision + '.zip', encoding: null }, ( error, response, content ) => {
                callback( content, signature );
            });
        };
        //
        let getSignature = ( callback ) => {
            request.get( { url: appArchiveURL + revision + '.sig', encoding: null }, ( error, response, content ) => {
                if( !error && response.statusCode === 200 ) {
                    getArchive( content, callback );
                }
            });
        };
        //
        getSignature( ( archive, signature  ) => {
            let verify = crypto.createVerify( 'RSA-SHA256' );
            verify.update( archive );
            console.log( 'SIZE:', archive.length, config.app.key.length, signature.length );
            if( verify.verify( config.app.key, signature ) ) {
                deleteFileEntry( cacheDirectory );
                extractArchive( archive, cacheDirectory, () => {
                    fs.writeFileSync( path.join( cacheDirectory, 'version' ), revision );
                    callback();
                });
            }
        });
    });
}

module.exports = cache;