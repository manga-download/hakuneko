import FoolSlide from './templates/FoolSlide.mjs';

export default class HastaTeam extends FoolSlide {

    constructor() {
        super();
        super.id = 'hastateam';
        super.label = 'Hasta Team';
        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];
        this.url = 'https://hastareader.com';

        this.path = '/slide/directory/';

        this.language = 'italian';
    }

    async _getPages(chapter) {
        let referer = new URL(chapter.id, this.url).href;
        let imageLinks = await super._getPages(chapter);
        return imageLinks.map(link => this.createConnectorURI({
            url: link,
            referer: referer
        }));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}