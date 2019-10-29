import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class HolyManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'holymanga';
        super.label = 'Holy Manga';
        this.tags = [ 'manga', 'english' ];
        // TODO: set URL so it always matches clipboard paste (e.g. http://ww7.holymanga.net), but also supports redirect ...
        this.url = 'http://ww7.holymanga.net';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri, this.requestOptions);
        await Engine.Request.fetchUI(request, '');
        let response = await fetch(request);
        this.url = new URL(response.url).origin;
    }
}