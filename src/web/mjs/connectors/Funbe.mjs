import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Funbe extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'funbe';
        super.label = 'Funbe';
        this.tags = [ 'webtoon', 'hentai', 'korean' ];
        this.url = 'https://funbe.shop';
    }

    canHandleURI(uri) {
        return /https?:\/\/funbe\.[a-z]+/.test(uri.origin);
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(await this._twitter.getProfileURL('1087681227832754182') || this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}