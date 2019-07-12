const path = require('path');
const { ConsoleLogger } = require('logtrine');
const Configuration = require('./Configuration');
const ConfigurationLinux = require('./ConfigurationLinux');
const ConfigurationDarwin = require('./ConfigurationDarwin');
const ConfigurationWindows = require('./ConfigurationWindows');
const CommandlineArgumentExtractor = require('./CommandlineArgumentExtractor');
const UpdateServerManager = require('./UpdateServerManager');
const CacheDirectoryManager = require('./CacheDirectoryManager');
const Updater = require('./Updater');
const ElectronBootstrap = require('./ElectronBootstrap');

module.exports = class App {

    constructor(logger) {
        this._logger = logger || new ConsoleLogger(ConsoleLogger.LEVEL.Warn);
        let extractor = new CommandlineArgumentExtractor(process.argv);
        this._configuration = this._getConfiguration(extractor.options);
        let serverManager = new UpdateServerManager(this._configuration.applicationUpdateURL, this._logger);
        let cacheManager = new CacheDirectoryManager(this._configuration.applicationCacheDirectory, this._logger);
        this._updater = new Updater(serverManager, cacheManager, this._logger);
        this._electron = new ElectronBootstrap(this._configuration, this._logger);
    }

    _getConfiguration(options) {
        if(Configuration.isPortableMode) {
            return new Configuration(options);
        }
        if(process.platform == 'linux') {
            return new ConfigurationLinux(options);
        }
        if(process.platform == 'darwin') {
            return new ConfigurationDarwin(options);
        }
        if(process.platform == 'win32') {
            return new ConfigurationWindows(options);
        }
    }

    printInfo() {
        let separator = '--------------';
        console.log();
        console.log(separator);
        console.log('Framework Info');
        console.log(separator );
        console.log('Electron :', process.versions.electron);
        console.log('Chrome   :', process.versions.chrome);
        console.log('Node     :', process.versions.node);
        console.log();
    }

    async run() {
        try {
            this.printInfo();
            this._configuration.printInfo();
            // add HakuNeko's application directory to the environment variable path (make ffmpeg available on windows)
            process.env.PATH += (process.platform === 'win32' ? ';' : ':') + path.dirname(process.execPath);
            // TODO: when updating it seems electron bootstrap will fail,because 
            // electron.protocol.registerSchemesAsPrivileged
            // must be the very first thing ...
            // maybe prepare shall return a promise before loading URL in window,
            // then the update can be performed and after that we can load the URL in window
            await this._updater.updateCache(this._configuration.publicKey);
            this._electron.prepare();
        } catch(error) {
            this._logger.error('Failed to start application!', error);
        }
    }
}