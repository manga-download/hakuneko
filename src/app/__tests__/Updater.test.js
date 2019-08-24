const http = require('http');
const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const { FileLogger } = require('@logtrine/logtrine');
const UpdateServerManager = require('../UpdateServerManager');
const CacheDirectoryManager = require('../CacheDirectoryManager');
const Updater = require('../Updater');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

const publicKey =
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzx5ZZjtNPDbf/iGqdjQj
FyCSIWF4dXDiRUWVga7yBBMJOOEidBDlHeAhQXj64f+IrXCxu+/ySNRgXTYp/1I7
S0HJsgcRz9AlzUVm6jeBZbFs42ggxVOxPA8RQDcEZFU/YDPQuYmz82euhI8VqDoZ
VlHmFOUICTgp7GvNNK94KDxx3H0qX9kv1U3tQEdxb9FFH5kzg4dR5/5WSriFFMNS
QDVrm5yAaEfty75u2Os1hobY9r5ACHpaoxitPBUNgqX7lORseb3t+dfoDVhowTXy
P0xJDQn8Kz3JTmVUjPnZO+JFcvVjtYU2x+i0ab/qfTDSB5W62HUFQZ40EUTXeNN3
owIDAQAB
-----END PUBLIC KEY-----`;

class TestFixture {

    constructor() {
        this._latest = undefined;
        this._archive = undefined;
        this._server = http.createServer(this._listener.bind(this));
    }

    get applicationCacheDirectory() {
        return path.join('test', 'cache');
    }

    get applicationUpdateURL() {
        return 'http://127.0.0.1:8080/latest';
    }

    get version() {
        return {
            file: path.join(this.applicationCacheDirectory, 'version'),
            content: '7ede91'
        };
    }

    get dummy() {
        return {
            file: path.join(this.applicationCacheDirectory, 'directory', 'file'),
            content: 'DUMMY'
        };
    }

    get index() {
        return {
            file: path.join(this.applicationCacheDirectory, 'index.html'),
            content: 'CACHE'
        };
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

    deleteMockDirectory() {
        try {
            fs.removeSync(this.applicationCacheDirectory);
        } catch(error) {
            logger.error('[TestFixture] Failed to delete (mock) cache directory!', error);
        }
    }

    createMockDirectory() {
        try {
            fs.ensureDirSync(path.join(this.applicationCacheDirectory, 'directory'), '0755');
            fs.writeFileSync(this.version.file, this.version.content);
            fs.writeFileSync(this.dummy.file, this.dummy.content);
        } catch(error) {
            logger.error('[TestFixture] Failed to create (mock) cache directory!', error);
        }
    }

    createTestee() {
        let serverManager = new UpdateServerManager(this.applicationUpdateURL, logger);
        let cacheManager = new CacheDirectoryManager(this.applicationCacheDirectory, logger);
        return new Updater(serverManager, cacheManager, logger);
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
describe('Updater', function () {

    let fixture = new TestFixture();

    describe('updateCache()', function () {

        it('should update cache when when cache is non-empty and server is newer and archive is valid', async () => {
            fixture.createMockDirectory();
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), "111111");
            assert.equal(fs.readFileSync(fixture.index.file, 'utf8'), "OK");
            assert.equal(fs.existsSync(fixture.dummy.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep cache when cache is non-empty and server is newer and archive is invalid', async () => {
            fixture.createMockDirectory();
            fixture.serverStart(fixture.emptyMock.signature, fixture.emptyMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), fixture.version.content);
            assert.equal(fs.readFileSync(fixture.dummy.file, 'utf8'), fixture.dummy.content);
            assert.equal(fs.existsSync(fixture.index.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep cache when cache is non-empty and server is newer and archive is valid and signature mismatch', async () => {
            fixture.createMockDirectory();
            fixture.serverStart(fixture.emptyMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), fixture.version.content);
            assert.equal(fs.readFileSync(fixture.dummy.file, 'utf8'), fixture.dummy.content);
            assert.equal(fs.existsSync(fixture.index.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep cache when cache is non-empty and server is same and archive is valid', async () => {
            fixture.createMockDirectory();
            fs.writeFileSync(fixture.version.file, '111111');
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), '111111');
            assert.equal(fs.readFileSync(fixture.dummy.file, 'utf8'), fixture.dummy.content);
            assert.equal(fs.existsSync(fixture.index.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep cache when cache is non-empty and server is same and archive is invalid', async () => {
            fixture.createMockDirectory();
            fs.writeFileSync(fixture.version.file, '000000');
            fixture.serverStart(fixture.emptyMock.signature, fixture.emptyMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), '000000');
            assert.equal(fs.readFileSync(fixture.dummy.file, 'utf8'), fixture.dummy.content);
            assert.equal(fs.existsSync(fixture.index.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep cache when cache is non-empty and server has error', async () => {
            fixture.createMockDirectory();
            fixture.serverStop();
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), fixture.version.content);
            assert.equal(fs.readFileSync(fixture.dummy.file, 'utf8'), fixture.dummy.content);
            assert.equal(fs.existsSync(fixture.index.file), false);
            fixture.deleteMockDirectory();
        });

        it('should update cache when cache is empty and server is newer and archive is valid', async () => {
            fixture.deleteMockDirectory();
            fixture.serverStart(fixture.archiveMock.signature, fixture.archiveMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.readFileSync(fixture.version.file, 'utf8'), "111111");
            assert.equal(fs.readFileSync(fixture.index.file, 'utf8'), "OK");
            assert.equal(fs.existsSync(fixture.dummy.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep (empty) cache when cache is empty and server is newer and archive is invalid', async () => {
            fixture.deleteMockDirectory();
            fixture.serverStart(fixture.emptyMock.signature, fixture.emptyMock.archive);
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            fixture.serverStop();
            assert.equal(fs.existsSync(fixture.version.file), false);
            assert.equal(fs.existsSync(fixture.index.file), false);
            assert.equal(fs.existsSync(fixture.dummy.file), false);
            fixture.deleteMockDirectory();
        });

        it('should keep (empty) when cache is empty and server has error', async () => {
            fixture.deleteMockDirectory();
            fixture.serverStop();
            let testee = fixture.createTestee();
            await testee.updateCache(publicKey);
            assert.equal(fs.existsSync(fixture.version.file), false);
            assert.equal(fs.existsSync(fixture.index.file), false);
            assert.equal(fs.existsSync(fixture.dummy.file), false);
            fixture.deleteMockDirectory();
        });
    });
});