const admzip = require( 'adm-zip' );
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * This package contains functions that should be run in main process context instead of render process context.
 * Reason: Performance.
 * When running heavy functions with massive data transfer (through ipc?) to render process, performence decreases drastically.
 * Keep amount of functions low to prevent incremental changes => low redistribution frequency of desktop client
 */
var hakuneko = {};

/**
 * Read image data from CBZ archive.
 * Declaration in main process because of performance, usage in render process.
 */
hakuneko.loadChapterPagesCBZ = ( archive, callback ) => {
    let zip = new admzip( archive );
    let pages = zip.getEntries().map( ( entry ) => {
        // TODO: extract files to temp folder and provide direct file links instead of base64 data
        // return 'file://' + entry.entryName;
        return 'data:' + pageFileMime( entry.entryName ) + ';base64,' + entry.getData().toString('base64');
    });
    callback( pages );
}

/**
 * Read image data from directory.
 * Declaration in main process because of performance, usage in render process.
 */
hakuneko.loadChapterPagesFolder = ( directory, callback ) => {
    fs.readdir( directory, ( error, files ) => {
        let pages = files.map( ( file ) => {
            file = path.join( directory, file );
            // websecurity is disabled => direct access to file links
            return 'file://' + file;
            //return 'data:image/jpeg;base64,' + fs.readFileSync( file ).toString( 'base64' );
        });
        callback( pages );
    });
}

/**
 * Helper function to get the mime time depending on the file extension of the gicen file name.
 */
function pageFileMime( file ) {
    let extension = path.extname( file );
    if( extension === '.jpg' ) {
        return 'image/jpeg';
    }
    if( extension === '.png' ) {
        return 'image/png';
    }
    if( extension === '.gif' ) {
        return 'image/gif';
    }
    if( extension === '.bmp' ) {
        return 'image/bmp';
    }
    if( extension === '.img' ) {
        return 'image/';
    }
    return 'application/octet-stream';
}

module.exports = hakuneko;