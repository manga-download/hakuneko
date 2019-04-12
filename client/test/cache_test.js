const fs = require( 'fs' );
const path = require( 'path' );
const http = require( 'http' );
const assert = require( './_testing.js' ).assert;
const cache = require( '../src/cache.js' );

// disable devleoper mode
require( '../src/config.js' ).app.developer = false;
var appURL = 'http://127.0.0.1:8080/latest';
var cacheDirectory = path.join( __dirname, 'cache' );

// helper function to delete an directory recursively
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

/***************
 *** MOCKUPS ***
 ***************/

var mockupFiles = {
    validSignatureValidArchive: {
        latest: '_valid.zip?signature=87627cda741492d3c947a0b119e11cb572236d59b46c610054dfd631697f53c6ccbeba615b8a772600755f524b8537b2ae9c7fb306b3b9057d10b2f3526d6e87a074a549af4375cbd6861267fa477303a50843ded86488400d0d62b3d2482146378eb3d278ce0ce17720823e6761793116bedb4f6771c05383c4324bb514436f4f0e3d6cabc1b627ae8af15119324d034588ad884179744eec8db24fcdbeb75a6d2490d535d909ec362e3cce74612167a8ae7e28daee599b3408d4ed192ae1a6484d84a34daafbd86b9c7b9c6776f10d0a9c352183d7c0a100309999cd541cc97412898e83df40e1d6aaf9b89c0c97f06fb7490bf191ac087fb339864fadc7f6',
        archive: new Buffer( '504b03040a0300000000168e4a4b2dd936d702000000020000000a000000696e6465782e68746d6c4f4b504b01023f030a0300000000168e4a4b2dd936d702000000020000000a0024000000000000002080a48100000000696e6465782e68746d6c0a002000000000000100180000568740df41d3010029563fdf41d30100568740df41d301504b050600000000010001005c0000002a0000000000', 'hex' )
    },
    validSignatureInvalidArchive: {
        latest: 'nvalid.zip?signature=8345939337c46abdbc27fd3bffff0618af75fc5b90a9872a310a9cef7f9cd23a2354fee47d9a1a4cb0d65e26527bef56c16f218697f590238ab5a364860984c284a2a3745f8817ba15086e7227f34d4c311fa541de23a48a3d2a19396ac1a992c8a78fc8a8a315402181bc8d10e91919e42b7fb50613fedebe5160b28b5703ecc5597ca3e2aad9913df616bbc82835bd7a0927222773e42aebf8c0ee637d5aef99dad456561ff6267c33a8656efb4b5644a925e7c1b6db370af8e491528591d479b3f6c04c0914d7df7a4233cd615c6790b1f4df2f2fed5582b966fb269b9268599010addce427b3f2c1809ac96519056cc3d8bd51c440ee50a650b1968a2392',
        archive: new Buffer( '87fb74631726132b3df3387819f286d8a298fefb6c64287cb3bc7a1e92cd2e83', 'hex' )
    },
    invalidSignatureValidArchive: {
        latest: 'nvalid.zip?signature=8345939337c46abdbc27fd3bffff0618af75fc5b90a9872a310a9cef7f9cd23a2354fee47d9a1a4cb0d65e26527bef56c16f218697f590238ab5a364860984c284a2a3745f8817ba15086e7227f34d4c311fa541de23a48a3d2a19396ac1a992c8a78fc8a8a315402181bc8d10e91919e42b7fb50613fedebe5160b28b5703ecc5597ca3e2aad9913df616bbc82835bd7a0927222773e42aebf8c0ee637d5aef99dad456561ff6267c33a8656efb4b5644a925e7c1b6db370af8e491528591d479b3f6c04c0914d7df7a4233cd615c6790b1f4df2f2fed5582b966fb269b9268599010addce427b3f2c1809ac96519056cc3d8bd51c440ee50a650b1968a2392',
        archive: new Buffer( '504b03040a0300000000168e4a4b2dd936d702000000020000000a000000696e6465782e68746d6c4f4b504b01023f030a0300000000168e4a4b2dd936d702000000020000000a0024000000000000002080a48100000000696e6465782e68746d6c0a002000000000000100180000568740df41d3010029563fdf41d30100568740df41d301504b050600000000010001005c0000002a0000000000', 'hex' )
    },
    invalidSignatureInvalidArchive: {
        latest: 'nvalid.zip?signature=87627cda741492d3c947a0b119e11cb572236d59b46c610054dfd631697f53c6ccbeba615b8a772600755f524b8537b2ae9c7fb306b3b9057d10b2f3526d6e87a074a549af4375cbd6861267fa477303a50843ded86488400d0d62b3d2482146378eb3d278ce0ce17720823e6761793116bedb4f6771c05383c4324bb514436f4f0e3d6cabc1b627ae8af15119324d034588ad884179744eec8db24fcdbeb75a6d2490d535d909ec362e3cce74612167a8ae7e28daee599b3408d4ed192ae1a6484d84a34daafbd86b9c7b9c6776f10d0a9c352183d7c0a100309999cd541cc97412898e83df40e1d6aaf9b89c0c97f06fb7490bf191ac087fb339864fadc7f6',
        archive: new Buffer( '87fb74631726132b3df3387819f286d8a298fefb6c64287cb3bc7a1e92cd2e83', 'hex' )
    }
};

var mock = undefined;

let server = http.createServer( ( request, response ) => {

    if( request.url === '/latest' ) {
        response.setHeader( 'Content-Type', 'text/plain' );
        response.statusCode = 200;
        response.end( mock.latest );
    }

    if( request.url.indexOf( '.zip' ) > -1 ) {
        response.setHeader( 'Content-Type', 'application/zip' );
        response.statusCode = 200;
        response.end( mock.archive );
    }
});

/*************
 *** TESTS ***
 *************/

//
function test_EmptyCacheNoConnection() {
    server.close();
    deleteFileEntry( cacheDirectory );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'ECONNREFUSED' ), 'Wrong error message' );
            assert.equal( false, fs.existsSync( cacheDirectory ), 'The cache directory must not be created!' );
            console.log( 'EmptyCacheNoConnection', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'EmptyCacheNoConnection', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_EmptyCacheWithConnectionInvalidSignatureInvalidArchive() {
    mock = mockupFiles.invalidSignatureInvalidArchive;
    server.listen( 8080 );
    deleteFileEntry( cacheDirectory );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'invalid signature' ), 'Wrong error message' );
            assert.equal( false, fs.existsSync( cacheDirectory ), 'The cache directory must not be created!' );
            console.log( 'EmptyCacheWithConnectionValidSignatureValidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'EmptyCacheWithConnectionValidSignatureValidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_EmptyCacheWithConnectionInvalidSignatureValidArchive() {
    mock = mockupFiles.invalidSignatureValidArchive;
    server.listen( 8080 );
    deleteFileEntry( cacheDirectory );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'invalid signature' ), 'Wrong error message' );
            assert.equal( false, fs.existsSync( cacheDirectory ), 'The cache directory must not be created!' );
            console.log( 'EmptyCacheWithConnectionInvalidSignatureValidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'EmptyCacheWithConnectionInvalidSignatureValidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_EmptyCacheWithConnectionValidSignatureInvalidArchive() {
    mock = mockupFiles.validSignatureInvalidArchive;
    server.listen( 8080 );
    deleteFileEntry( cacheDirectory );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'is this a zip file' ), 'Wrong error message' );
            assert.equal( false, fs.existsSync( cacheDirectory ), 'The cache directory must not be created!' );
            console.log( 'EmptyCacheWithConnectionValidSignatureInvalidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'EmptyCacheWithConnectionValidSignatureInvalidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_EmptyCacheWithConnectionValidSignatureValidArchive() {
    mock = mockupFiles.validSignatureValidArchive;
    server.listen( 8080 );
    deleteFileEntry( cacheDirectory );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.equal( null, error, 'Unexpected error' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must be created!' );
            assert.equal( '_valid', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'EmptyCacheWithConnectionValidSignatureValidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'EmptyCacheWithConnectionValidSignatureValidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_WithCacheNoConnection() {
    server.close();
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '000001' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'ECONNREFUSED' ), 'Wrong error message' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '000001', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'WithCacheNoConnection', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'WithCacheNoConnection', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_WithCacheWithConnectionInvalidSignatureInvalidArchive() {
    mock = mockupFiles.invalidSignatureInvalidArchive;
    server.listen( 8080 );
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '000002' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'invalid signature' ), 'Wrong error message' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '000002', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'WithCacheWithConnectionInvalidSignatureInvalidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'WithCacheWithConnectionInvalidSignatureInvalidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_WithCacheWithConnectionInvalidSignatureValidArchive() {
    mock = mockupFiles.invalidSignatureValidArchive;
    server.listen( 8080 );
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '000003' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'invalid signature' ), 'Wrong error message' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '000003', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'WithCacheWithConnectionInvalidSignatureInvalidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'WithCacheWithConnectionInvalidSignatureInvalidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_WithCacheWithConnectionValidSignatureInvalidArchive() {
    mock = mockupFiles.validSignatureInvalidArchive;
    server.listen( 8080 );
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '000004' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'is this a zip file' ), 'Wrong error message' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '000004', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'WithCacheWithConnectionValidSignatureInvalidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'WithCacheWithConnectionValidSignatureInvalidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_WithCacheWithConnectionValidSignatureValidArchive() {
    mock = mockupFiles.validSignatureValidArchive;
    server.listen( 8080 );
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '000005' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.equal( null, error, 'Unexpected error' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '_valid', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'WithCacheWithConnectionValidSignatureValidArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'WithCacheWithConnectionValidSignatureValidArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

//
function test_CacheVersionSameAsArchive() {
    mock = mockupFiles.validSignatureValidArchive;
    server.listen( 8080 );
    fs.mkdirSync( cacheDirectory );
    fs.writeFileSync( path.join( cacheDirectory, 'version' ), '_valid' );
    cache.update( appURL, cacheDirectory, ( error ) => {
        try {
            assert.nequal( null, error, 'Expected error missing' );
            assert.nequal( -1, error.message.indexOf( 'same as the online revision' ), 'Wrong error message' );
            assert.equal( true, fs.existsSync( cacheDirectory ), 'The cache directory must not be deleted!' );
            assert.equal( '_valid', fs.readFileSync( path.join( cacheDirectory, 'version' ) ).toString( 'utf8' ), 'Invalid version' );
            console.log( 'CacheVersionSameAsArchive', '=>', 'OK' );
        } catch ( e ) {
            console.error( 'CacheVersionSameAsArchive', '=>', 'ERROR', e.message );
        } finally {
            deleteFileEntry( cacheDirectory );
            server.close();
        }
    });
}

// run all test cases
setTimeout( test_EmptyCacheNoConnection, 0 );
setTimeout( test_EmptyCacheWithConnectionInvalidSignatureInvalidArchive, 2500 );
setTimeout( test_EmptyCacheWithConnectionInvalidSignatureValidArchive, 5000 );
setTimeout( test_EmptyCacheWithConnectionValidSignatureInvalidArchive, 7500 );
setTimeout( test_EmptyCacheWithConnectionValidSignatureValidArchive, 10000 );

setTimeout( test_WithCacheNoConnection, 12500 );
setTimeout( test_WithCacheWithConnectionInvalidSignatureInvalidArchive, 15000 );
setTimeout( test_WithCacheWithConnectionInvalidSignatureValidArchive, 17500 );
setTimeout( test_WithCacheWithConnectionValidSignatureInvalidArchive, 20000 );
setTimeout( test_WithCacheWithConnectionValidSignatureValidArchive, 22500 );

setTimeout( test_CacheVersionSameAsArchive, 25000 );