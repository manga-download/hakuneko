import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TuMangaNet extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tumanganet';
        super.label = 'Tu Manga Online';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://tumanga.net';
    }

    // NOTE: Initialize website without parameters, otherwise the request will time out
    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }
}