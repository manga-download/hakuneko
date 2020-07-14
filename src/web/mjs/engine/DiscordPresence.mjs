const discordPresenceId = '726702836775256094';
const DiscordRPC = require('discord-rpc');
DiscordRPC.register(discordPresenceId);

export default class DiscordPresence {

    constructor(settings) {
        this.rpc = null;
        this.updater = null;
        this.IpcBytes = 0; // keep track of IPC connection
        this.lastUpdate = 0; // timestamp of last IPC message

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

        // EventListener
        document.addEventListener( EventListener.onSelectConnector, this._onSelectConnector.bind(this) );
        document.addEventListener( EventListener.onSelectManga, this._onSelectManga.bind(this) );
        document.addEventListener( EventListener.onSelectChapter, this._onSelectChapter.bind(this) );
    }

    _onSettingsChanged() {
        console.log('SETTINGS');
        this.enabled = this._settings.discordPresence.value !== 'none';
        this.enabledHentai = this._settings.discordPresence.value === 'hentai';

        if (this.enabled) {
            this.statusNew = true;
            this.startDiscordPresence();
        } else {
            this.stopDiscordPresence();
        }
    }

    _onSelectConnector(event) {
        this.isThisHentai(event.detail.tags);
        this.status['details'] = 'Browsing ' + event.detail.label;
        if (this.status.state) delete this.status.state;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    _onSelectManga(event) {
        this.isThisHentai(event.detail.connector.tags);
        this.status['details'] = 'Browsing ' + event.detail.connector.label;
        this.status['state'] = 'Looking at ' + event.detail.title;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    _onSelectChapter(event) {
        this.isThisHentai(event.detail.manga.connector.tags);
        this.status['details'] = 'Viewing ' + event.detail.manga.title;
        this.status['state'] = event.detail.title;
        this.status.startTimestamp = + new Date();
        this.statusNew = true;
        if (this.enabled && !this.rpc) this.startDiscordPresence();
    }

    isThisHentai(tags) {
        // Hentai check
        tags = tags.map(t => t.toLowerCase());
        if(tags.includes('hentai') || tags.includes('porn')) {
            this.hentai = true;
        } else {
            this.hentai = false;
        }
    }

    async updateStatus() {
        console.log('UPDATE');
        if(this.rpc && +new Date()-this.lastUpdate >= 15 ) {
            console.log('DO');
            console.log(this.rpc);
            if (this.enabled && this.statusNew) {
                console.log('enabled&new:'+this.rpc.transport.socket.bytesWritten);
                this.IpcBytes = this.rpc.transport.socket.bytesWritten;
                if( !this.hentai || this.hentai && this.enabledHentai) {
                    this.rpc.setActivity(this.status);
                    this.lastUpdate = +new Date();
                } else {
                    this.statusNew = false;
                }
            }

            // Test if IPC is still active
            if ( this.statusNew && this.rpc.transport.socket.bytesWritten > this.IpcBytes) {
                this.IpcBytes = this.rpc.transport.socket.bytesWritten;
                this.statusNew = false;
            } else if (this.rpc.transport.socket.bytesWritten == this.IpcBytes && this.statusNew) {
                console.warn('WARNING: DiscordPresence - Lost connection to Discord.');
                this.stopDiscordPresence();
            }
        } else {
            console.log('update called, but 15s did not pass');
            console.log(this.lastUpdate);
            console.log(+new Date());
        }
    }

    stopDiscordPresence() {
        console.log('STOP');
        this.statusNew = false;
        clearInterval(this.updater);
        if (this.rpc) {
            this.rpc.clearActivity();
            this.rpc.destroy();
            this.rpc = null;
        }
    }

    async startDiscordPresence() {
        console.log('START');
        if(this.rpc) {
            console.log('already running');
            return; // already running ...
        }
        this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
        this.rpc.on('ready', () => {
            this.status.startTimestamp = + new Date();

            // some delay for Discord to be receptive
            setTimeout( () => {
                this.updateStatus();
            }, 2000);

            // activity can only be set every 15 seconds
            this.updater = setInterval(() => {
                this.updateStatus();
            }, 15000);
        });

        this.rpc.login({ clientId: discordPresenceId })
            .catch (error => {
                console.log(error);
                if (error == undefined ) {
                    console.warn('WARNING: DiscordPresence - Foreign IPC connection was closed)');
                    this.restartDiscordPresence();
                } else if (error.message.match(/[A-z]+/g).join('').toUpperCase() == 'COULDNOTCONNECT') {
                    console.warn('WARNING: DiscordPresence - Could not connect (Is Discord running?)');
                } else if (error.message.toUpperCase() == 'RPC_CONNECTION_TIMEOUT') {
                    console.warn('WARNING: DiscordPresence - IPC connection timeout (Is Discord still running?)');
                    this.restartDiscordPresence();
                } else {
                    throw new Error(error);
                }
                this.rpc = null;
            });
    }

    async restartDiscordPresence() {
        console.log('RESTART');
        await this.stopDiscordPresence();
        await this.wait(15000);
        this.startDiscordPresence();
    }

    wait( time ) {
        return new Promise( resolve => {
            setTimeout( resolve, time );
        } );
    }
}