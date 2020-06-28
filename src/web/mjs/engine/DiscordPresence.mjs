const discordPresenceId = '726702836775256094';

export default class DiscordPresence {
    constructor(settings) {
        this._settings = settings; // Engine.Settings
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
        this.enabled = settings.discordPresence.value;

        // Connector selected
        document.addEventListener( EventListener.onSelectConnector, this._onSelectConnector.bind(this) );
        // Manga selected
        document.addEventListener( EventListener.onMangaClicked, this._onMangaClicked.bind(this) );
        // get Pages (Reader/Downloader)
        document.addEventListener( EventListener.onChapterGetPages, this._onChapterGetPages.bind(this) );
    }

    _onSettingsChanged() {
        this.enabled = this._settings.discordPresence.value;
    }

    _onSelectConnector(e) {
        console.log('_onSelectConnector!!');
        console.log(e);
    }

    _onMangaClicked(e) {
        console.log('_onMangaClicked!!');
        console.log(e);
    }

    _onChapterGetPages(e) {
        console.log('onChapterGetPages!!');
        console.log(e);
    }
}