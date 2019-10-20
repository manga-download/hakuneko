module.exports = class CommandlineArgumentExtractor {

    constructor(argv) {
        this._argv = argv;
    }

    _get(key, isFlag) {
        let option = this._argv.find(arg => arg.startsWith(key + '='));
        let index = this._argv.findIndex(arg => arg === key);

        if(isFlag) {
            return index > -1 || option !== undefined;
        }

        if(option) {
            let value = option.split('=')[1];
            return !value ? undefined : value;
        }

        if(index > -1 && index + 1 < this._argv.length) {
            let value = this._argv[index + 1];
            return value.startsWith('-') ? undefined : value;
        }

        return undefined;
    }

    /**
     * See: http://docopt.org
     */
    printInfo() {
        console.log('');
        console.log('Usage:');
        console.log(' ', process.execPath, '[OPTIONS]');
        console.log('');
        console.log('Options:');
        console.log(' ', '-u, --update-url=<URL>     ', 'URL to be checked for web-application updates');
        console.log(' ', '                           ', 'Default: "http://manga-download.github.io/hakuneko/{version}/latest"');
        console.log(' ', '--startup-url=<URL>        ', 'URL to the entrypoint of the web-application');
        console.log(' ', '                           ', 'Default: "hakuneko://cache/index.html"');
        console.log(' ', '-c, --cache-directory=<DIR>', 'Directory where the web-application is stored');
        console.log(' ', '                           ', 'Default: system\'s default');
        console.log(' ', '--user-directory=<DIR>     ', 'Directory where user settings are stored');
        console.log(' ', '                           ', 'Default: system\'s default');
        console.log('');
    }

    /**
     * Extract <Configuration> compatible options from the arguments provided through the commandline
     */
    get options() {
        return {
            applicationUpdateURL:         this._get('--update-url') || this._get('-u'),
            applicationStartupURL:        this._get('--startup-url'),
            applicationCacheDirectory:    this._get('--cache-directory') || this._get('-c'),
            applicationUserDataDirectory: this._get('--user-directory')
        };
    }
};