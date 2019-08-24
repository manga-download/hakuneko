const { ConsoleLogger } = require('@logtrine/logtrine');

module.exports = class Updater {

    /**
     *
     * @param {UpdateServerManager} serverManager
     * @param {CacheDirectoryManager} cacheManager
     * @param {Logger} logger
     */
    constructor(serverManager, cacheManager, logger) {
        this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Info);
        this._serverManager = serverManager;
        this._cacheManager = cacheManager;
    }

    /**
     *
     */
    async updateCache(pubkey) {
        try {
            this._logger.info('Checking for Update...');
            let updateInfo = await this._serverManager.getUpdateInfo();
            this._logger.info('Remote Version:', updateInfo.version);
            let currentVersion = await this._cacheManager.getCurrentVersion();
            this._logger.info('Local Version:', currentVersion);
            if(updateInfo.version !== currentVersion) {
                this._logger.info('Starting Update...');
                let archive = await this._serverManager.getUpdateArchive(updateInfo);
                await updateInfo.validate(archive, pubkey);
                await this._cacheManager.applyUpdateArchive(updateInfo.version, archive);
                this._logger.info('Update Complete');
            } else {
                this._logger.info('Update Check Complete');
            }
        } catch(error) {
            this._logger.error('Update Failed!', error);
        }
    }
};