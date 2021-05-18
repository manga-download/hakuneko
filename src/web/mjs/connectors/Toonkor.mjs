import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Toonkor extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'toonkor';
        super.label = 'Toonkor';
        this.tags = ['webtoon', 'korean'];
        this.url = 'https://tkor.zone';
    }

    canHandleURI(uri) {
        return /https?:\/\/(?:toonkor|tkor)\.[a-z]+/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(await this._twitter.getProfileURL('1202224761771741184') || this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}