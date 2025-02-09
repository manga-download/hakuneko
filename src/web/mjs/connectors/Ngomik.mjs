import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ngomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ngomik';
        super.label = 'Ngomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://ngomik.mom';
        this.path = '/manga/list-mode/';
    }

    async _initializeConnector() {
        // NOTE: Multiple domains may be protected by CloudFlare and needs to be unlocked ...
        const domains = [ this.url, 'https://cdn.ngomik.in', 'https://cdn2.ngomik.in' ];
        for(let domain of domains) {
            let uri = new URL(domain);
            let request = new Request(uri.href, this.requestOptions);
            await Engine.Request.fetchUI(request, '', 60000, true);
        }
    }
}
