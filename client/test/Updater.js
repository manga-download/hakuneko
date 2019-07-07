const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const { FileLogger } = require('logtrine');
const Updater = require('../src/Updater');
var logger = new FileLogger('test/Updater.log', FileLogger.LEVEL.All);
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
        //
    }
/*
    static get applicationCacheDirectory() {
        return './test/cache';
    }

    static get version() {
        return {
            file: './test/cache/version',
            content: '7ede91'
        };
    }

    static deleteMockDirectory() {
        try {
            fs.unlinkSync(this.version.file);
            fs.rmdirSync(this.applicationCacheDirectory);
        } catch(error) {
            logger.error('[TestFixture] Failed to delete cache directory!', error);
        }
    }

    static createMockDirectory() {
        try {
            fs.mkdirSync(this.applicationCacheDirectory, '0755');
            fs.writeFileSync(this.version.file, this.version.content);
        } catch(error) {
            logger.error('[TestFixture] Failed to create cache directory!', error);
        }
    }

    static createTestee() {
        return new CacheDirectoryManager(this.applicationCacheDirectory, logger);
    }
*/
}

/**
 * MODULE TESTS
 */
describe('Updater', function () {

    this.timeout(5000);

    describe('updateCache', function () {

        it('smoke test', async () => {
            const UpdateServerManager = new require('../src/UpdateServerManager');
            let serverMock = new UpdateServerManager('https://raw.githubusercontent.com/manga-download/releases/master/0.4.0/latest', logger);

            const CacheDirectoryManager = new require('../src/CacheDirectoryManager');
            let cacheMock = new CacheDirectoryManager('./test/cache', logger);

            let testee = new Updater(serverMock, cacheMock, logger);
            testee.updateCache(publicKey);
        });
/*
        it('when server has no update and cache has no content then no update', async () => {
            // assert
        });

        it('when server has no update and cache has content then no update', async () => {
            //
        });

        it('when server has invalid update and cache has no content then no update', async () => {
            // assert
        });

        it('when server has invalid update and cache has content then no update', async () => {
            //
        });
*/
    });
});