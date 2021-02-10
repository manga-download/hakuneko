import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class HeavenManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'heavenmanga';
        super.label = 'MyToon';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mytoon.net';
    }

    canHandleURI(uri) {
        return /https?:\/\/(w+\d*.)?mytoon.net/.test(uri.origin);
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages.filter(page => !/cover.png$/.test(page));
    }
}