const path = require('path');
const electron = require('electron');
const Configuration = require('./Configuration');

module.exports = class ConfigurationWindows extends Configuration {

    constructor(configuration) {
        super(configuration);
        let options = configuration || {};
        let applicationLocalDirectory = path.normalize(path.join(electron.app.getPath('appData'), '..', 'Local', electron.app.getName()));
        this._applicationCacheDirectory = options['applicationCacheDirectory'] || path.join(applicationLocalDirectory, 'cache'); // => ~\AppData\Local\hakuneko-desktop\cache
        this._applicationUserDataDirectory = options['applicationUserDataDirectory'] || electron.app.getPath('userData');
    }
};