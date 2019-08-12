const path = require('path');
const fs = require('fs-extra');
const { FileLogger } = require('logtrine');
const CacheDirectoryManager = require('../../src/app/CacheDirectoryManager');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

class TestFixture {

    constructor() {
        //
    }

    static get applicationCacheDirectory() {
        return path.join('test', 'cache');
    }

    static get version() {
        return {
            file: path.join(this.applicationCacheDirectory, 'version'),
            content: '7ede91'
        };
    }

    static get dummy() {
        return {
            file: path.join(this.applicationCacheDirectory, 'directory', 'file'),
            content: 'DUMMY'
        };
    }

    static get index() {
        return {
            file: path.join(this.applicationCacheDirectory, 'index.html'),
            content: 'OK'
        };
    }

    static get archiveValidMock() {
        return Buffer.from('504b03040a0300000000168e4a4b2dd936d702000000020000000a000000696e6465782e68746d6c4f4b504b01023f030a0300000000168e4a4b2dd936d702000000020000000a0024000000000000002080a48100000000696e6465782e68746d6c0a002000000000000100180000568740df41d3010029563fdf41d30100568740df41d301504b050600000000010001005c0000002a0000000000', 'hex');
    }

    static get archiveInvalidMock() {
        return Buffer.from('87fb74631726132b3df3387819f286d8a298fefb6c64287cb3bc7a1e92cd2e83', 'hex');
    }

    static deleteMockDirectory() {
        try {
            fs.removeSync(this.applicationCacheDirectory);
        } catch(error) {
            logger.error('[TestFixture] Failed to delete (mock) cache directory!', error);
        }
    }

    static createMockDirectory() {
        try {
            fs.ensureDirSync(path.join(this.applicationCacheDirectory, 'directory'), '0755');
            fs.writeFileSync(this.version.file, this.version.content);
            fs.writeFileSync(this.dummy.file, this.dummy.content);
        } catch(error) {
            logger.error('[TestFixture] Failed to create (mock) cache directory!', error);
        }
    }

    static createTestee() {
        return new CacheDirectoryManager(this.applicationCacheDirectory, logger);
    }
}

/**
 * MODULE TESTS
 */
describe('CacheDirectoryManager', function () {
    describe('getCurrentVersion()', function () {
        it('when file exist then valid result', async () => {
            TestFixture.createMockDirectory();
            let testee = TestFixture.createTestee();
            let version = await testee.getCurrentVersion();
            TestFixture.deleteMockDirectory();
            expect(version).toEqual(TestFixture.version.content);
        });
        it('when file not exist then undefined', async () => {
            TestFixture.deleteMockDirectory();
            let testee = TestFixture.createTestee();
            let version = await testee.getCurrentVersion();
            expect(version).toEqual(undefined);
        });
    });
    describe('applyUpdateArchive()', function () {
        it('when archive invalid and cache empty then cache empty', async () => {
            TestFixture.deleteMockDirectory();
            let testee = TestFixture.createTestee();
            expect.assertions(2);
            try {
                await testee.applyUpdateArchive('111111', TestFixture.archiveInvalidMock);
            } catch(error) {
                expect(error.message.split(':')[0].trim()).toEqual('Can\'t find end of central directory');
                expect(fs.existsSync(TestFixture.applicationCacheDirectory)).toEqual(false);
            } finally {
                TestFixture.deleteMockDirectory();
            }
        });
        it('when archive invalid and cache exist then cache kept', async () => {
            TestFixture.createMockDirectory();
            let testee = TestFixture.createTestee();
            expect.assertions(4);
            try {
                await testee.applyUpdateArchive('111111', TestFixture.archiveInvalidMock);
            } catch(error) {
                expect(error.message.split(':')[0].trim()).toEqual('Can\'t find end of central directory');
                expect(fs.readFileSync(TestFixture.version.file, 'utf8')).toEqual(TestFixture.version.content);
                expect(fs.readFileSync(TestFixture.dummy.file, 'utf8')).toEqual(TestFixture.dummy.content);
                expect(fs.existsSync(TestFixture.index.file)).toEqual(false);
            } finally {
                TestFixture.deleteMockDirectory();
            }
        });
        it('when archive valid and cache empty then cache created', async () => {
            TestFixture.deleteMockDirectory();
            let testee = TestFixture.createTestee();
            await testee.applyUpdateArchive('111111', TestFixture.archiveValidMock);
            expect(fs.readFileSync(TestFixture.version.file, 'utf8')).toEqual('111111');
            expect(fs.readFileSync(TestFixture.index.file, 'utf8')).toEqual('OK');
            expect(fs.existsSync(TestFixture.dummy.file)).toEqual(false);
            TestFixture.deleteMockDirectory();
        });
        it('when archive valid and cache exist then cache replaced', async () => {
            TestFixture.createMockDirectory();
            let testee = TestFixture.createTestee();
            await testee.applyUpdateArchive('111111', TestFixture.archiveValidMock);
            expect(fs.readFileSync(TestFixture.version.file, 'utf8')).toEqual('111111');
            expect(fs.readFileSync(TestFixture.index.file, 'utf8')).toEqual('OK');
            expect(fs.existsSync(TestFixture.dummy.file)).toEqual(false);
            TestFixture.deleteMockDirectory();
        });
    });
});