export default class LanguageManager {

    constructor(settings) {
        this._list = [];
        this.currentLanguage = {};
        this._settings = settings; // Engine.Settings
        this.language = 'en';

        this._settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    _onSettingsChanged() {
        this.language = this._settings.language.value;
        this.currentLanguage = this._list.find(language => language.languageCode == this.language);
    }

    async _loadLanguages(uri) {
        try {
            let response = await fetch(uri);
            let data = await response.json();
            return data.filter(lang => !lang.startsWith('.') && lang.endsWith('.json')).map(lang => uri + lang);
        } catch(error) {
            return [];
        }
    }

    async initialize() {
        let languages = await this._loadLanguages('hakuneko://cache/i18n/');
        await this.register(languages);
        this.currentLanguage = this._list[0];
    }

    get list() {
        return this._list;
    }

    async register(files) {
        try {
            for(let file of files) {
                try {
                    let response = await fetch(file);
                    let language = await response.json();
                    this._list.push(language);
                } catch(error) {
                    console.warn(`Failed to load language "${file}"`, error);
                }
            }
        } catch (error) {
            console.warn(`Failed to load languages`, error);
        }
    }

    translate(key) {
        var translation = key.split('.').reduce((obj, key) => obj && obj[key], this.currentLanguage);
        return typeof translation !== 'undefined' ? translation : key.split('.').reduce((obj, key) => obj && obj[key], this._list.find(language => language.languageCode == 'en'));
    }
}