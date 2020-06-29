const discordPresenceId = '726702836775256094';
const DiscordRPC = require('discord-rpc');
DiscordRPC.register(discordPresenceId);

export default class DiscordPresence {

    constructor(settings) {
        this.rpc = null;
        this.IpcBytes = 0; // keep track of IPC connection

        this._settings = settings; // Engine.Settings
        this.enabled = false;
        this.enabledHentai = false;
        this.hentai = false; // Is current item hentai?

        this._settings.addEventListener('loaded', this._onSettingsChanged.bind(this));
        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));

        // Current status
        this.status = {
            largeImageKey: 'logo',
            largeImageText: 'Manga & Anime Downloader for Linux, Windows & MacOS'
        };
        this.statusNew = true;

        // EvetnListener for:
        // Connector selected
        document.addEventListener( EventListener.onSelectConnector, this._onSelectConnector.bind(this) );
        // Manga selected
        document.addEventListener( EventListener.onMangaClicked, this._onMangaClicked.bind(this) );
        // get chapter pages (Reader/Downloader)
        document.addEventListener( EventListener.onChapterGetPages, this._onChapterGetPages.bind(this) );

        this.startDiscordPresence();
    }

    _onSettingsChanged() {
        switch (this._settings.discordPresence.value) {
            case 'none':
                this.enabled = false;
                this.enabledHentai = false;
                break;
            case 'nohentai':
                this.enabled = true;
                this.enabledHentai = false;
                break;
            case 'hentai':
                this.enabled = true;
                this.enabledHentai = true;
                break;
            default:
                this.enabled = false;
                this.enabledHentai = false;
        }

        if (this.enabled) {
            this.statusNew = true;
            this.startDiscordPresence();
        } else {
            this.stopDiscordPresence();
        }
    }

    _onSelectConnector(e) {
        // Hentai check
        if(e.detail.tags.includes('hentai') || e.detail.tags.includes('porn')) {
            this.hentai = true;
        } else {
            this.hentai = false;
        }

        this.status['details'] = 'Browsing ' + e.detail.label;
        if (this.status.state) delete this.status.state;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    _onMangaClicked(e) {
        // Hentai check
        if(e.detail.connector.tags.includes('hentai') || e.detail.connector.tags.includes('porn')) {
            this.hentai = true;
        } else {
            this.hentai = false;
        }

        this.status['details'] = 'Browsing ' + e.detail.connector.label;
        this.status['state'] = 'Looking at ' + e.detail.title;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    _onChapterGetPages(e) {
        // Hentai check
        if(e.detail.manga.connector.tags.includes('hentai') || e.detail.manga.connector.tags.includes('porn')) {
            this.hentai = true;
        } else {
            this.hentai = false;
        }

        this.status['details'] = 'Reading ' + e.detail.manga.title;
        this.status['state'] = e.detail.title;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    async updateStatus() {
        if(this.rpc) {
            if (this.enabled && this.statusNew) {
                this.IpcBytes = this.rpc.transport.socket.bytesWritten;
                if( !this.hentai || (this.hentai && this.enabledHentai)) {
                    this.rpc.setActivity(this.status);
                } else {
                    this.IpcBytes -= 1; // Otherwise IPC will be considered dead
                }
            }

            // Test if IPC is still active
            if ( this.rpc.transport.socket.bytesWritten > this.IpcBytes) {
                this.IpcBytes = this.rpc.transport.socket.bytesWritten;
                this.statusNew = false;
            } else if (this.rpc.transport.socket.bytesWritten == this.IpcBytes && this.statusNew) {
                console.warn('WARNING: DiscordPresence - Lost connection to Discord.');
                this.stopDiscordPresence();
            }
        }
    }

    stopDiscordPresence() {
        this.statusNew = false;
        if (this.rpc) {
            this.rpc.clearActivity();
            this.rpc.destroy();
            this.rpc = null;
        }
    }

    async startDiscordPresence() {
        if (!this.rpc) {
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
            this.rpc.on('ready', () => {
                this.status.startTimestamp = + new Date();
                
                // some delay for Discord to be receptive
                setTimeout( () => {
                    this.updateStatus();
                }, 2000);

                // activity can only be set every 15 seconds
                setInterval(() => {
                    this.updateStatus();
                }, 15200);
            });
            let connect = await this.rpc.login({ clientId: discordPresenceId })
            .catch (error => {
                if (error.message == 'Could not connect') {
                    console.warn('WARNING: DiscordPresence - Could not connect (Is Discord running?)');
                } else {
                    throw new Error(error);
                }
                this.rpc = null;
            });
        }
    }
}