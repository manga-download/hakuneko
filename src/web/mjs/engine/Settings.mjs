export default class Settings {

    // TODO: use dependency injection instead of globals for Engine.Storage, Engine.Conenctors
    constructor() {
        let app = require( 'electron' ).remote.app;
        let path = require( 'path' );
        let docs = undefined;
        try {
            // on some circumstances the documents directory might not be found by electron
            docs = app.getPath( 'documents' );
        } catch ( e ) {
            docs = '.';
        }
        this.readerEnabled = {
            label: 'Enable Reader',
            description: 'Show a preview panel and a basic reader for the chapters',
            input: Input.checkbox,
            value: true
        };
        this.baseDirectory = {
            label: 'Manga Directory',
            description: 'The base directory where all downloaded mangas will be stored',
            input: Input.directory,
            value: path.join( docs, 'Mangas' )
        };
        this.useSubdirectory = {
            label: 'Use Sub-Directories',
            description: 'Create sub-directories for each website (e.g. "/downloads/mangadex/...")',
            input: Input.checkbox,
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
            input: Input.text,
            value: ''
        };
        this.chapterFormat = {
            label: 'Chapter File Format',
            description: 'Store chapters in the selected file format',
            input: Input.select,
            options: [
                { value: ChapterFormat.img, name: 'Folder with Images (*.jpg, *.png, *.webp)' },
                { value: ChapterFormat.cbz, name: 'Comic Book Archive (*.cbz)' },
                { value: ChapterFormat.pdf, name: 'Portable Document (*.pdf)' },
                { value: ChapterFormat.epub, name: 'Ebook Reader (*.epub)' },
            ],
            value: ChapterFormat.img
        };
        this.recompressionFormat = {
            label: 'De-Scrambling Format',
            description: [
                'Select the re-compression format that shall be used for scrambled images.',
                'Only applies to scrambled images!',
                'Unscrambled images are stored natively (no re-compression will be applied).'
            ].join( '\n' ),
            input: Input.select,
            options: [
                { value: 'image/webp', name: 'WEBP (*.webp)' },
                { value: 'image/jpeg', name: 'JPEG (*.jpg)' },
                { value: 'image/png', name: 'PNG (*.png)' },
            ],
            value: 'image/jpeg'
        };
        this.recompressionQuality = {
            label: 'De-Scrambling Quality',
            description: [
                'Select the re-compression quality that shall be used for scrambled images.',
                'Only applies to WEBP and JPEG, has no effect on PNG (which is lossless).'
            ].join( '\n' ),
            input: Input.numeric,
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
            input: Input.text,
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
            input: Input.password,
            value: ''
        };
        this.downloadHistoryLogFormat = {
            label: 'Download History Format',
            description: [
                'Log the history of completed chapter downloads.',
                'The log file(s) can be found in HakuNeko\'s user data directory.'
            ].join( '\n' ),
            input: Input.select,
            options: [
                { value: HistoryFormat.none, name: 'Disabled' },
                //{ value: HistoryFormat.json, name: 'JSON (*.json)' },
                //{ value: HistoryFormat.csv, name: 'CSV (*.csv)' },
            ],
            value: HistoryFormat.none
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
            input: Input.text,
            value: ''
        };
    }
/*
    // expose property iterator through a generator function
    static *[Symbol.iterator]() {
        for( let property in this) {
            yield this[property];
        }
    }
*/
    /**
     * Load and apply the settings and configurations from the given profile.
     * Callback will be executed after the data has been loaded.
     * Callback will be provided with an error (or null if no error).
     */
        loadProfile( profile, callback ) {
        Engine.Storage.loadConfig( 'settings' )
        .then( data => {
            // apply general settings
            for( let property in this) {
                if( data && property in data ) {
                    this[property].value = this._getDecryptedValue( this[property].input, data[property] );
                }
            }
            // check manga base directory existence
            Engine.Storage.directoryExist( this.baseDirectory.value ).catch( error => alert( 'WARNING: Cannot access the base directory for mangas!\n\n' + error.message ) );
            // apply settings to each connector
            Engine.Connectors.forEach( ( connector ) => {
                for( let property in connector.config ) {
                    if( data && data.connectors && connector.id in data.connectors && property in data.connectors[connector.id] ) {
                        connector.config[property].value = this._getDecryptedValue( connector.config[property].input, data.connectors[connector.id][property] );
                        connector.config[property].value = this._getValidValue( connector.config[property] );
                    }
                }
            } );
            document.dispatchEvent( new CustomEvent( EventListener.onSettingsChanged, { detail: this } ) );
            if( typeof( callback ) === typeof( Function ) ) {
                callback( null );
            }
        } )
        .catch( error => {
            if( typeof( callback ) === typeof( Function ) ) {
                callback( error );
            }
        } );
    }

    /**
     * Save the current settings and configurations for the given profile.
     * Callback will be executed after the data has been saved.
     * Callback will be provided with an error (or null if no error).
     */
    saveProfile( profile, callback ) {
        let data = {
            connectors: {}
        };
        // gather general settings
        for( let property in this) {
            //this[property] = ( property in data ? data[property] : this[property] );
            data[property] = this._getEncryptedValue( this[property].input, this[property].value );
        }
        // gather settings from each connector
        Engine.Connectors.forEach( ( connector ) => {
            data.connectors[connector.id] = {};
            for( let property in connector.config ) {
                data.connectors[connector.id][property] = this._getEncryptedValue( connector.config[property].input, connector.config[property].value );
            }
        });

        Engine.Storage.saveConfig( 'settings', data, 2 )
        .then( () => {
            document.dispatchEvent( new CustomEvent( EventListener.onSettingsChanged, { detail: this } ) );
            if( typeof( callback ) === typeof( Function ) ) {
                callback( null );
            }
        } )
        .catch( error => {
            if( typeof( callback ) === typeof( Function ) ) {
                callback( error );
            }
        } );
    }

    /**
     * 
     */
    _getEncryptedValue( inputType, decryptedValue ) {
        if( inputType !== Input.password || !decryptedValue || decryptedValue.length < 1 ) {
            return decryptedValue;
        }
        // hakuneko must be portable and work offline => impossible to generate a secure key
        // so keep things simple and at least secure the password in case the data was leeched and cannot be asociated with hakuneko
        return CryptoJS.AES.encrypt( decryptedValue, 'HakuNeko!' ).toString();
    }

    /**
     * 
     */
    _getDecryptedValue( inputType, encryptedValue ) {
        if( inputType !== Input.password || !encryptedValue || encryptedValue.length < 1 ) {
            return encryptedValue;
        }
        return CryptoJS.AES.decrypt( encryptedValue, 'HakuNeko!' ).toString( CryptoJS.enc.Utf8 );
    }

    /**
     * 
     */
    _getValidValue( connectorProperty ) {
        switch( connectorProperty.input ) {
            case Input.numeric:
                let value = connectorProperty.value;
                if( connectorProperty.min !== undefined ) {
                    value = Math.max( value, connectorProperty.min );
                }
                if( connectorProperty.max !== undefined ) {
                    value = Math.min( value, connectorProperty.max );
                }
                return value;
            default:
                return connectorProperty.value;

        }
    }
}