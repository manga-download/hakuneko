const events = {
    loaded: 'loaded',
    saved: 'saved'
};

const extensions = {
    // chapter formats
    img:  'img',
    cbz:  '.cbz',
    pdf:  '.pdf',
    epub: '.epub',
    // history formats
    none: '',
    json: '.json',
    csv:  '.csv'
};

const mimes = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png'
};

const types = {
    disabled: 'disabled',
    text: 'text',
    password: 'password',
    numeric: 'numeric',
    select: 'select',
    checkbox: 'checkbox',
    file: 'file',
    directory: 'directory'
};

export default class Settings extends EventTarget {

    // TODO: use dependency injection instead of globals for Engine.Storage, Engine.Conenctors
    constructor() {
        super();
        let app = require( 'electron' ).remote.app;
        let path = require( 'path' );
        let docs = undefined;
        try {
            // on some circumstances the documents directory might not be found by electron
            docs = app.getPath( 'documents' );
        } catch ( e ) {
            docs = '.';
        }

        this.frontend = {
            label: 'Frontend ⁽¹⁾',
            description: [
                'Select the UI frontend that should be used for the manga download engine.',
                '',
                '⁽¹⁾ Restart required to take affect',
            ].join('\n'),
            input: types.select,
            options: [
                { value: 'frontend@classic-light', name: 'Classic (Light)' },
                { value: 'frontend@classic-dark', name: 'Ken\'s Daedal Dark' }
            ],
            value: 'frontend@classic-light'
        };

        this.readerEnabled = {
            label: 'Enable Reader',
            description: 'Show a preview panel and a basic reader for the chapters',
            input: types.checkbox,
            value: true
        };

        this.baseDirectory = {
            label: 'Manga Directory',
            description: 'The base directory where all downloaded mangas will be stored',
            input: types.directory,
            value: path.join( docs, 'Mangas' )
        };

        this.bookmarkDirectory = {
            label: 'Bookmarks Directory',
            description: [
                'The directory where the bookmark and chaptermark files will be stored.',
                'This setting has no effect when the application is in portable mode!'
            ].join('\n'),
            input: process.env.HAKUNEKO_PORTABLE ? types.disabled : types.directory,
            value: app.getPath( 'userData' )
        };

        this.useSubdirectory = {
            label: 'Use Sub-Directories',
            description: 'Create sub-directories for each website (e.g. "/downloads/mangadex/...")',
            input: types.checkbox,
            value: false
        };

        this.chapterTitleFormat = {
            label: 'Chapter Title Format',
            description: [
                'Define the chapter name format.',
                'This is an experimental feature, volume/chapter numbers are extracted directly from the original name.',
                'May fail in some cases and also reduce performance!',
                '',
                'Supported placeholders:',
                '  %C% - Connector title',
                '  %M% - Manga title',
                '  %VOL% - Volume number',
                '  %CH% - Chapter number',
                '  %T% - Chapter title (without volume/chapter number)',
                '  %O% - Chapter title (original)'
            ].join( '\n' ),
            input: types.text,
            value: ''
        };

        this.chapterFormat = {
            label: 'Chapter File Format',
            description: 'Store chapters in the selected file format',
            input: types.select,
            options: [
                { value: extensions.img, name: 'Folder with Images (*.jpg, *.png, *.webp)' },
                { value: extensions.cbz, name: 'Comic Book Archive (*.cbz)' },
                { value: extensions.pdf, name: 'Portable Document (*.pdf)' },
                { value: extensions.epub, name: 'Ebook Reader (*.epub)' },
            ],
            value: extensions.img
        };

        this.recompressionFormat = {
            label: 'De-Scrambling Format',
            description: [
                'Select the re-compression format that shall be used for scrambled images.',
                'Only applies to scrambled images!',
                'Unscrambled images are stored natively (no re-compression will be applied).'
            ].join( '\n' ),
            input: types.select,
            options: [
                { value: mimes.webp, name: 'WEBP (*.webp)' },
                { value: mimes.jpeg, name: 'JPEG (*.jpg)' },
                { value: mimes.png, name: 'PNG (*.png)' },
            ],
            value: mimes.jpeg
        };

        this.recompressionQuality = {
            label: 'De-Scrambling Quality',
            description: [
                'Select the re-compression quality that shall be used for scrambled images.',
                'Only applies to WEBP and JPEG, has no effect on PNG (which is lossless).'
            ].join( '\n' ),
            input: types.numeric,
            min: 50,
            max: 100,
            value: 90
        };

        this.proxyRules = {
            label: 'Proxy Rules',
            description: [
                'Set the proxy servers that shall be used.',
                'Leave blank to ignore.',
                '',
                'Examples:',
                '  http=proxy.web:80',
                '  http=127.0.0.1:8080;https=127.0.0.1:8080;socks=127.0.0.1:8081',
                '',
                'More info: https://git.io/hakuneko-proxy'
            ].join( '\n' ),
            input: types.text,
            options: [],
            value: ''
        };

        this.proxyAuth = {
            label: 'Proxy Authentication',
            description: [
                'Set the username and password for the proxy server(s).',
                'Use ":" as separator between both terms.',
                'Only basic auth is supported!',
                '',
                'Examples:',
                '  username:password'
            ].join( '\n' ),
            input: types.password,
            value: ''
        };

        this.downloadHistoryLogFormat = {
            label: 'Download History Format',
            description: [
                'Log the history of completed chapter downloads.',
                'The log file(s) can be found in HakuNeko\'s user data directory.'
            ].join( '\n' ),
            input: types.select,
            options: [
                { value: extensions.none, name: 'Disabled' },
                /*
                 *{ value: extensions.json, name: 'JSON (*.json)' },
                 *{ value: extensions.csv, name: 'CSV (*.csv)' },
                 */
            ],
            value: extensions.none
        };

        this.postChapterDownloadCommand = {
            label: 'Post Command',
            description: [
                'This command will be executed after a chapter download is complete.',
                'The working directory is the folder containing the downloaded chapter.',
                'Leave blank to ignore.',
                '',
                'Supported placeholders:',
                '  %PATH% - Path to downloaded chapter folder/file',
                '  %C% - Connector title',
                '  %M% - Manga title',
                '  %O% - Chapter title',
                '',
                'Examples:',
                '  convert "%PATH%\\*.webp" -scene 1 "%PATH%\\%03d.png"',
                '  md "%O%_conv" & convert "%PATH%\\*.*" -scene 1 "%O%_conv\\%03d.png"'
            ].join( '\n' ),
            input: types.text,
            value: ''
        };
    }

    *[Symbol.iterator]() {
        for(let key in this) {
            let property = this[key];
            if(property instanceof Object && property.input) {
                yield property;
            }
        }
    }

    *_getCategorizedSettings() {
        yield {
            category: 'General',
            settings: [...this]
        };
        for(let connector of Engine.Connectors) {
            if(connector.config instanceof Object) {
                yield {
                    category: connector.label,
                    settings: Object.keys(connector.config).map(key => connector.config[key])
                };
            }
        }
    }

    getCategorizedSettings() {
        return [...this._getCategorizedSettings()];
    }

    async load() {
        try {
            let data = await Engine.Storage.loadConfig('settings');
            // apply general settings
            for(let key in this) {
                if(data
                    && data[key] !== undefined
                    && this[key]
                    && this[key].input
                    && this[key].input !== types.disabled)
                {
                    this[key].value = this._getDecryptedValue(this[key].input, data[key]);
                    this[key].value = this._getValidValue('General', this[key]);
                }
            }
            // apply settings to each connector
            for(let connector of Engine.Connectors) {
                for(let key in connector.config) {
                    if(data
                        && data.connectors
                        && data.connectors[connector.id]
                        && data.connectors[connector.id][key] !== undefined
                        && connector.config[key]
                        && connector.config[key].input)
                    {
                        connector.config[key].value = this._getDecryptedValue(connector.config[key].input, data.connectors[connector.id][key]);
                        connector.config[key].value = this._getValidValue(connector.label, connector.config[key], true);
                    }
                }
            }
            this.dispatchEvent(new CustomEvent(events.loaded, { detail: this }));
        } catch(error) {
            console.error('Failed to load HakuNeko settings!', error);
        }
    }

    async save() {
        try {
            let data = {};
            // gather general settings
            for(let key in this) {
                if(this[key] && this[key].input && this[key].input !== types.disabled) {
                    data[key] = this._getEncryptedValue(this[key].input, this[key].value);
                }
            }
            // gather settings from each connector
            data['connectors'] = {};
            for(let connector of Engine.Connectors) {
                data.connectors[connector.id] = {};
                for(let key in connector.config) {
                    data.connectors[connector.id][key] = this._getEncryptedValue(connector.config[key].input, connector.config[key].value);
                }
            }
            await Engine.Storage.saveConfig('settings', data, 2);
            this.dispatchEvent(new CustomEvent(events.saved, { detail: this }));
        } catch(error) {
            console.error('Failed to save HakuNeko settings!', error);
        }
    }

    /**
     *
     * @param inputType
     * @param decryptedValue
     */
    _getEncryptedValue(inputType, decryptedValue) {
        if(inputType !== types.password || !decryptedValue || decryptedValue.length < 1) {
            return decryptedValue;
        }
        return CryptoJS.AES.encrypt(decryptedValue, 'HakuNeko!').toString();
    }

    /**
     *
     * @param inputType
     * @param encryptedValue
     */
    _getDecryptedValue(inputType, encryptedValue) {
        if(inputType !== types.password || !encryptedValue || encryptedValue.length < 1) {
            return encryptedValue;
        }
        return CryptoJS.AES.decrypt(encryptedValue, 'HakuNeko!').toString(CryptoJS.enc.Utf8);
    }

    /**
     *
     */
    _getValidValue(scope, setting, silent) {
        let value = setting.value;
        switch(setting.input) {
            case types.numeric:
                if(setting.min !== undefined && value < setting.min) {
                    return setting.min;
                }
                if(setting.max !== undefined && value > setting.max) {
                    return setting.max;
                }
                return value;
            case types.directory:
                Engine.Storage.directoryExist(value)
                    .catch(error => {
                        let message = `WARNING: Cannot access the directory for "${setting.label}" from "${scope}" settings!\n\n${error.message}`;
                        if(silent) {
                            console.warn(message, error);
                        } else {
                            alert(message);
                        }
                    });
                return value;
            default:
                return value;
        }
    }
}