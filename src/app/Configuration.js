const path = require('path');
const fs = require('fs-extra');
const electron = require('electron');

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

module.exports = class Configuration {

    /**
     * Configuration for portable usage of the application
     * See also: https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
     * @param {Configuration} configuration Another configuration (object/structure) from which the properties shall be applied
     */
    constructor(configuration) {
        let options = configuration || {};
        let applicationExecutableDirectory = path.dirname(electron.app.getPath('exe'));
        this._applicationUpdateURL = options['applicationUpdateURL'] || 'https://manga-download.github.io/hakuneko/6.1.7/latest';
        this._applicationStartupURL = options['applicationStartupURL'] || 'hakuneko://cache/index.html';
        this._applicationCacheDirectory = options['applicationCacheDirectory'] || path.join(applicationExecutableDirectory, 'cache');
        this._applicationUserDataDirectory = options['applicationUserDataDirectory'] || path.join(applicationExecutableDirectory, 'userdata');
    }

    printInfo() {
        let separator = '-------------';
        console.log('');
        console.log(separator);
        console.log('Configuration');
        console.log(separator);
        console.log('Update URL           :', this.applicationUpdateURL);
        console.log('Connector Protocol   :', this.connectorProtocol);
        console.log('Application Protocol :', this.applicationProtocol);
        console.log('Startup URL          :', this.applicationStartupURL);
        console.log('AppCache Directory   :', this.applicationCacheDirectory);
        console.log('UserData Directory   :', this.applicationUserDataDirectory);
        console.log('');
    }

    static get isPortableMode() {
        return fs.existsSync(electron.app.getPath('exe') + '.portable');
    }

    get publicKey() {
        return publicKey;
    }

    get applicationUpdateURL() {
        return this._applicationUpdateURL;
    }

    get applicationProtocol() {
        return new URL(this._applicationStartupURL).protocol.slice( 0, -1 );
    }

    get connectorProtocol() {
        return 'connector';
    }

    get applicationStartupURL() {
        return this._applicationStartupURL;
    }

    get applicationCacheDirectory() {
        return this._absolute(this._applicationCacheDirectory);
    }

    get applicationUserDataDirectory() {
        return this._absolute(this._applicationUserDataDirectory);
    }

    get applicationUserPluginsDirectory() {
        return path.join(this.applicationUserDataDirectory, 'hakuneko.plugins');
    }

    _absolute(endpoint) {
        return path.resolve(electron.app.getAppPath(), path.normalize(endpoint));
    }
};