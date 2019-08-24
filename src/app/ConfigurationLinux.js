const electron = require('electron');
const Configuration = require('./Configuration');

module.exports = class ConfigurationLinux extends Configuration {

    constructor(configuration) {
        super(configuration);
        let options = configuration || {};
        this._applicationCacheDirectory = options['applicationCacheDirectory'] || electron.app.getPath('userCache'); // => ~/.cache/hakuneko-desktop
        this._applicationUserDataDirectory = options['applicationUserDataDirectory'] || electron.app.getPath('userData');
    }
};