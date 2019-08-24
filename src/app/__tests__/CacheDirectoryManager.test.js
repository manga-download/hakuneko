const path = require('path');
const { FileLogger } = require('@logtrine/logtrine');
const CacheDirectoryManager = require('../CacheDirectoryManager');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

jest.mock('fs-extra');
const fs = require('fs-extra');

jest.mock('jszip');
const jszip = require('jszip');

var loadAsyncMock;
jszip.mockImplementation(() => {
    return {
        loadAsync: loadAsyncMock
    };
});

describe('CacheDirectoryManager', function () {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        //
    });

    describe('getCurrentVersion()', function () {
        it('should get version when file exists', async () => {
            fs.readFile.mockReturnValueOnce(Promise.resolve('xxx'));
            let testee = new CacheDirectoryManager('/cache', logger);
            let version = await testee.getCurrentVersion();
            expect(version).toEqual('xxx');
        });
        it('should get undefined when an error occurs', async () => {
            fs.readFile.mockReturnValueOnce(Promise.reject(new Error('File not found!')));
            let testee = new CacheDirectoryManager('/cache', logger);
            let version = await testee.getCurrentVersion();
            expect(version).toEqual(undefined);
        });
    });

    describe('_extractZipEntry()', function () {
        it('should skip directory entries', async () => {
            fs.ensureDir.mockReturnValueOnce(Promise.resolve());
            fs.writeFile.mockReturnValueOnce(Promise.resolve());
            let archiveMock = {
                files: {
                    'dir/sub': {
                        dir: true,
                        async: jest.fn(() => Promise.resolve('RAW BYTES'))
                    }
                }
            };
            let testee = new CacheDirectoryManager('/cache', logger);
            await testee._extractZipEntry(archiveMock, '/cache', 'dir/sub');
            expect(fs.ensureDir).not.toHaveBeenCalled();
            expect(fs.writeFile).not.toHaveBeenCalled();
            expect(archiveMock.files['dir/sub'].async).not.toHaveBeenCalled();
        });
        it('should create directory and extract file', async () => {
            fs.ensureDir.mockReturnValueOnce(Promise.resolve());
            fs.writeFile.mockReturnValueOnce(Promise.resolve());
            let archiveMock = {
                files: {
                    'dir/sub/file': {
                        dir: false,
                        async: jest.fn(() => Promise.resolve('RAW BYTES'))
                    }
                }
            };
            let testee = new CacheDirectoryManager('/cache', logger);
            await testee._extractZipEntry(archiveMock, '/cache', 'dir/sub/file');
            expect(fs.ensureDir).toHaveBeenCalledTimes(1);
            expect(fs.ensureDir).toHaveBeenLastCalledWith(path.normalize('/cache/dir/sub'));
            expect(fs.writeFile).toHaveBeenCalledTimes(1);
            expect(fs.writeFile).toHaveBeenLastCalledWith(path.normalize('/cache/dir/sub/file'), 'RAW BYTES');
            expect(archiveMock.files['dir/sub/file'].async).toHaveBeenCalledTimes(1);
            expect(archiveMock.files['dir/sub/file'].async).toHaveBeenLastCalledWith('uint8array');
        });
    });

    describe('applyUpdateArchive()', function () {
        it('should keep existing cache when archive is invalid', async () => {
            loadAsyncMock = jest.fn(() => Promise.reject());
            let testee = new CacheDirectoryManager('/cache', logger);
            testee._extractZipEntry = jest.fn();
            expect.assertions(5);
            try {
                await testee.applyUpdateArchive('1.0.0', 'ARCHIVE BYTES');
            } catch(error) {
                expect(loadAsyncMock).toHaveBeenCalledTimes(1);
                expect(loadAsyncMock).toHaveBeenLastCalledWith('ARCHIVE BYTES', {});
                expect(fs.remove).not.toHaveBeenCalled();
                expect(fs.writeFile).not.toHaveBeenCalled();
                expect(testee._extractZipEntry).not.toHaveBeenCalled();
            }
        });
        it('should replace existing cache when archive is valid', async () => {
            let archive = {
                files: {
                    'index.html': null,
                    'js': null,
                    'js/app.js': null
                }
            };
            loadAsyncMock = jest.fn(() => Promise.resolve(archive));
            let testee = new CacheDirectoryManager('/cache', logger);
            testee._extractZipEntry = jest.fn();
            await testee.applyUpdateArchive('1.0.0', 'ARCHIVE BYTES');
            expect(loadAsyncMock).toHaveBeenCalledTimes(1);
            expect(loadAsyncMock).toHaveBeenLastCalledWith('ARCHIVE BYTES', {});
            expect(fs.remove).toHaveBeenCalled();
            expect(fs.remove).toHaveBeenLastCalledWith(path.normalize('/cache'));
            expect(fs.writeFile).toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenLastCalledWith(path.normalize('/cache/version'), '1.0.0');
            expect(testee._extractZipEntry).toHaveBeenCalledTimes(3);
            expect(testee._extractZipEntry).toHaveBeenCalledWith(archive, path.normalize('/cache'), 'index.html');
            expect(testee._extractZipEntry).toHaveBeenCalledWith(archive, path.normalize('/cache'), 'js');
            expect(testee._extractZipEntry).toHaveBeenCalledWith(archive, path.normalize('/cache'), 'js/app.js');
        });
    });
});