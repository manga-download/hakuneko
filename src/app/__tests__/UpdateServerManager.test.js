const http = require('http');
const assert = require('assert');
const { FileLogger } = require('@logtrine/logtrine');
const UpdateServerManager = require('../UpdateServerManager');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

class TestFixture {

    constructor() {
        this._latest = undefined;
        this._archive = undefined;
        this._server = http.createServer(this._listener.bind(this));
    }

    /**
     *
     */
    get applicationUpdateURL() {
        return 'http://127.0.0.1:8080/latest';
    }

    // signature matches and archive is valid ZIP
    get archiveMock() {
        return {
            signature: '111111.zip?signature=87627cda741492d3c947a0b119e11cb572236d59b46c610054dfd631697f53c6ccbeba615b8a772600755f524b8537b2ae9c7fb306b3b9057d10b2f3526d6e87a074a549af4375cbd6861267fa477303a50843ded86488400d0d62b3d2482146378eb3d278ce0ce17720823e6761793116bedb4f6771c05383c4324bb514436f4f0e3d6cabc1b627ae8af15119324d034588ad884179744eec8db24fcdbeb75a6d2490d535d909ec362e3cce74612167a8ae7e28daee599b3408d4ed192ae1a6484d84a34daafbd86b9c7b9c6776f10d0a9c352183d7c0a100309999cd541cc97412898e83df40e1d6aaf9b89c0c97f06fb7490bf191ac087fb339864fadc7f6',
            archive: Buffer.from('504b03040a0300000000168e4a4b2dd936d702000000020000000a000000696e6465782e68746d6c4f4b504b01023f030a0300000000168e4a4b2dd936d702000000020000000a0024000000000000002080a48100000000696e6465782e68746d6c0a002000000000000100180000568740df41d3010029563fdf41d30100568740df41d301504b050600000000010001005c0000002a0000000000', 'hex')
        };
    }

    // signature matches, but archive is not valid ZIP
    get emptyMock() {
        return {
            signature: '000000.zip?signature=8345939337c46abdbc27fd3bffff0618af75fc5b90a9872a310a9cef7f9cd23a2354fee47d9a1a4cb0d65e26527bef56c16f218697f590238ab5a364860984c284a2a3745f8817ba15086e7227f34d4c311fa541de23a48a3d2a19396ac1a992c8a78fc8a8a315402181bc8d10e91919e42b7fb50613fedebe5160b28b5703ecc5597ca3e2aad9913df616bbc82835bd7a0927222773e42aebf8c0ee637d5aef99dad456561ff6267c33a8656efb4b5644a925e7c1b6db370af8e491528591d479b3f6c04c0914d7df7a4233cd615c6790b1f4df2f2fed5582b966fb269b9268599010addce427b3f2c1809ac96519056cc3d8bd51c440ee50a650b1968a2392',
            archive: Buffer.from('87fb74631726132b3df3387819f286d8a298fefb6c64287cb3bc7a1e92cd2e83', 'hex')
        };
    }

    /**
     *
     */
    createTestee() {
        return new UpdateServerManager(this.applicationUpdateURL, logger);
    }

    /**
     *
     * @param {Request} request
     * @param {Response} response
     */
    _listener(request, response) {
        if(request.url === '/latest') {
            response.setHeader('Content-Type', 'text/plain');
            response.statusCode = 200;
            return response.end(this._latest);
        }
        if(request.url.includes('.zip')) {
            response.setHeader('Content-Type', 'application/zip');
            response.statusCode = 200;
            return response.end(this._archive);
        }
        response.setHeader('Content-Type', 'text/plain');
        response.statusCode = 404;
        return response.end();
    }

    /**
     *
     * @param {string} latest
     * @param {Uint8Array | Buffer} archive
     */
    serverStart(latest, archive) {
        this._latest = latest;
        this._archive = archive;
        this._server.listen(8080);
    }

    /**
     *
     */
    serverStop() {
        this._server.close();
    }
}

/**
 * MODULE TESTS
 */
describe('UpdateServerManager', function () {

    let fixture = new TestFixture();

    describe('constructor()', function () {

        it('should use URL when URL is valid', async () => {
            let testee = new UpdateServerManager('https://localhost', logger);
            assert.equal(testee._applicationUpdateURL, 'https://localhost');
        });

        it('should use default when URL is invalid', async () => {
            let testee = new UpdateServerManager('null', logger);
            assert.equal(testee._applicationUpdateURL, undefined);
        });

        it('should use default when URL is undefined', async () => {
            let testee = new UpdateServerManager(undefined, logger);
            assert.equal(testee._applicationUpdateURL, undefined);
        });

        it('should use default when URL has wrong type', async () => {
            let testee = new UpdateServerManager(123, logger);
            assert.equal(testee._applicationUpdateURL, undefined);
        });
    });

    describe('getUpdateInfo()', function () {

        it('should get valid result when URL is valid', async () => {
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            let info = await testee.getUpdateInfo();
            fixture.serverStop();
            assert.equal(info.version.length, 6);
            assert.equal(/[a-f0-9]+/.test(info.version), true);
            assert.equal(info.signature.length, 512);
            assert.equal(/[a-f0-9]+/.test(info.signature), true);
            let expected = fixture.applicationUpdateURL.replace('latest', info.version + '.zip?signature=' + info.signature);
            assert.equal(info.link, expected);
        });

        it('should throw error when URL does not exist', async () => {
            let testee = new UpdateServerManager(fixture.applicationUpdateURL + '/invalid', logger);
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            try {
                await testee.getUpdateInfo();
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Status: 404');
            } finally {
                fixture.serverStop();
            }
        });

        it('should throw error when host cannot be reached', async () => {
            let testee = fixture.createTestee();
            try {
                await testee.getUpdateInfo();
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'connect ECONNREFUSED 127.0.0.1:8080');
            }
        });

        it('should throw error when URL is invalid', async () => {
            let testee = new UpdateServerManager('null', logger);
            try {
                await testee.getUpdateInfo();
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Invalid request for connection to the update server!');
            }
        });

        it('should throw error when URL is undefined', async () => {
            let testee = new UpdateServerManager(undefined, logger);
            try {
                await testee.getUpdateInfo();
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Invalid request for connection to the update server!');
            }
        });
    });

    describe('getUpdateArchive()', function () {

        it('should get valid result when URL is valid', async () => {
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            let info = await testee.getUpdateInfo();
            let archive = await testee.getUpdateArchive(info);
            fixture.serverStop();
            assert.equal(archive.length, fixture.archiveMock.archive.length);
        });

        it('should throw error when URL does not exist', async () => {
            let testee = fixture.createTestee();
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            try {
                await testee.getUpdateArchive({link: fixture.applicationUpdateURL + '/invalid'});
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Status: 404');
            } finally {
                fixture.serverStop();
            }
        });

        it('should throw error when host cannot be reached', async () => {
            let testee = fixture.createTestee();
            try {
                await testee.getUpdateArchive({link: fixture.applicationUpdateURL + '.zip'});
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'connect ECONNREFUSED 127.0.0.1:8080');
            }
        });

        it('should throw error when URL is invalid', async () => {
            let testee = fixture.createTestee();
            try {
                await testee.getUpdateArchive({link: 'foobar'});
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Invalid URL: foobar');
            }
        });

        it('should throw error when URL is undefined', async () => {
            let testee = fixture.createTestee();
            try {
                await testee.getUpdateArchive({link: undefined});
                assert.fail('Expected error not thrown!');
            } catch(error) {
                assert.equal(error.message, 'Invalid request for connection to the update server!');
            }
        });
    });
});