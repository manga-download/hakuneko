import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikTap extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiktap';
        super.label = 'KomikTap';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://komiktap.in';
        this.path = '/manga/list-mode/';
    }

    async _initializeConnector() {
        const response = await fetch(this.url);
        const newUrl = new URL(response.url);
        this.url = newUrl.origin;
        this.hostPattern = newUrl.host;
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
    canHandleURI(uri) {
        super.initialize()
            .then(() => {
                return uri.href.includes(this.url);
            });
    }
}
