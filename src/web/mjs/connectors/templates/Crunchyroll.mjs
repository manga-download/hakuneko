import Connector from '../../engine/Connector.mjs';

// See: https://github.com/CloudMax94/crunchyroll-api/wiki/Api
export default class Crunchyroll extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = 'https://crunchyroll.com';
        this.api = 'https://api.crunchyroll.com';
        this.apiURL = 'https://api.crunchyroll.com';

        this.config = {
            device: {
                label: 'Device',
                description: 'Select what device should be pretended when connecting to Crunchyroll.',
                input: 'select',
                options: [
                    { value: 'windows', name: 'Windows' },
                    { value: 'crunchyroid', name: 'Crunchydroid' },
                    { value: 'android', name: 'Android' },
                    { value: 'ios', name: 'iOS' }
                ],
                value: 'windows'
            },
            locale: {
                label: 'Locale',
                description: [
                    'Select what locale should be used when connecting to Crunchyroll.',
                    'Localized media will be preferred, if unavailable use English (US).'
                ].join('\n'),
                input: 'select',
                options: [
                    { value: 'enUS', name: 'English (US)' },
                    { value: 'enGB', name: 'English (GB)' },
                    { value: 'frFR', name: 'French' },
                    { value: 'deDE', name: 'German (DE)' },
                    { value: 'jaJP', name: 'Japanese' },
                    { value: 'ptBR', name: 'Portuguese (BR)' },
                    { value: 'ptPT', name: 'Portuguese (PT)' },
                    { value: 'esES', name: 'Spanish (ES)' },
                    { value: 'esLA', name: 'Spanish (LA)' }
                ],
                value: 'enUS'
            },
            username: {
                label: 'Username',
                description: 'Username for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: 'password',
                value: ''
            }
        };
    }

    async _initializeConnector() {
        this._credentials = {
            username: this.config.username.value,
            password: this.config.password.value
        };
        await this._logout();
    }

    get _devices() {
        return {
            windows: {
                type: 'com.crunchyroll.windows.desktop',
                token: 'LNDJgOit5yaRIWN'
            },
            crunchyroid: {
                type: 'com.crunchyroll.crunchyroid',
                token: 'Scwg9PRRZ19iVwD'
            },
            android: {
                type: 'com.crunchyroll.manga.android',
                token: 'FLpcfZH4CbW4muO'
            },
            ios: {
                type: 'com.crunchyroll.iphone',
                token: 'QWjz212GspMHH9h'
            }
        };
    }

    _createURI(origin, path) {
        let uri = new URL(path, origin);
        //uri.searchParams.set('api_ver', 1); // => seems to be optional
        let device = this._devices[this.config.device.value];
        let identifier = '2fa9e3886d132f87'; // Date.now().toString(16); // random HEX (16 char)
        uri.searchParams.set('device_id', identifier);
        uri.searchParams.set('device_type', device.type);
        if(this._sessionID) {
            uri.searchParams.set('session_id', this._sessionID);
        } else {
            uri.searchParams.set('access_token', device.token);
        }
        if(this._authToken) {
            uri.searchParams.set('auth', this._authToken);
        }
        uri.searchParams.set('locale', this.config.locale.value);
        return uri;
    }

    async _updateCredentials() {
        let updated = false;
        if(this._credentials.username !== this.config.username.value) {
            await this._logout();
            this._credentials.username = this.config.username.value;
            updated = true;
        }
        if(this._credentials.password !== this.config.password.value) {
            await this._logout();
            this._credentials.password = this.config.password.value;
            updated = true;
        }
        return updated;
    }

    _validateCredentials() {
        return this._credentials.username && this._credentials.password;
    }

    async _isLoggedIn() {
        if(!this._sessionID || !this._authToken) {
            return false;
        }
        let uri = this._createURI(this.api, '/start_session.0.json');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return !data.error && data.data.user && data.data.user.username === this._credentials.username;
    }

    async _startSession() {
        if(!this._sessionID) {
            let uri = this._createURI(this.api, '/start_session.0.json');
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);
            if(data.error) {
                console.warn('Session failed!', this);
            } else {
                this._sessionID = data.data.session_id;
            }
        }
    }

    async _logout() {
        if(await this._isLoggedIn()) {
            let uri = this._createURI(this.api, '/logout.0.json');
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);
            if(data.error) {
                console.warn('Logout failed!', this);
            }
        }
        this._sessionID = undefined;
        this._authToken = undefined;
        this._subscriptions = [];
    }

    async _login() {
        let isCredentialsUpdated = await this._updateCredentials();
        let isLoggedIn = await this._isLoggedIn();
        if(!this._validateCredentials()) {
            throw new Error('No username/password provided!');
        }
        if(isCredentialsUpdated || !isLoggedIn) {
            await this._startSession();
            let uri = this._createURI(this.api, '/login.0.json');
            uri.searchParams.set('account', this._credentials.username);
            uri.searchParams.set('password', this._credentials.password);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);
            if(data.error) {
                throw new Error(data.message);
            } else {
                this._authToken = data.data.auth;
                this._subscriptions = data.data.user.premium.split('|') ;
            }
        }
    }
}