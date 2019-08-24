const path = require('path');
const fs = require('fs-extra');
const jszip = require('jszip');
const { ConsoleLogger } = require('@logtrine/logtrine');

module.exports = class CacheDirectoryManager {

    /**
     *
     * @param {string} applicationCacheDirectory
     * @param {Logger} logger
     */
    constructor(applicationCacheDirectory, logger) {
        try {
            this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
            this._applicationCacheDirectory = path.normalize(applicationCacheDirectory);
            this._versionFile = path.join(this._applicationCacheDirectory, 'version');
        } catch(error) {
            this._applicationCacheDirectory = undefined;
            this._versionFile = undefined;
        }
    }

    /**
     * Extract an entry from an archive to the given directory
     * and resolve a promise with the path to the extracted file.
     * @param {JSZip} archive
     * @param {string} directory
     * @param {string} entry
     * @returns {Promise<void>} A promise that will resolve on success, otherwise reject with a related error
     */
    _extractZipEntry(archive, directory, entry) {
        if(!archive.files[entry].dir) {
            let file = path.join(directory, entry);
            this._logger.verbose('Extracting:', file);
            return fs.ensureDir(path.dirname(file))
                .then(() => archive.files[entry].async('uint8array'))
                .then(data => fs.writeFile(file, data));
        } else {
            return Promise.resolve();
        }
    }

    /**
     *
     * @returns {Promise<string>}
     */
    getCurrentVersion() {
        return fs.readFile(this._versionFile, 'utf8')
            .catch(() => Promise.resolve(undefined));
    }

    /**
     *
     * @param {string} version
     * @param {Uint8Array} data
     * @returns {void}
     */
    async applyUpdateArchive(version, data) {
        let zip = new jszip();
        let archive = await zip.loadAsync(data, {});
        await fs.remove(this._applicationCacheDirectory);
        let entries = Object.keys(archive.files);
        let promises = entries.map(entry => this._extractZipEntry(archive, this._applicationCacheDirectory, entry));
        await Promise.all(promises);
        await fs.writeFile(this._versionFile, version);
    }
};