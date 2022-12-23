import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class HolyManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'holymanga';
        super.label = 'Holy Manga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://w30.holymanga.net';
    }

    canHandleURI(uri) {
        return /https?:\/\/w+\d*.holymanga.net/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages.filter(page => !/cover.png$/.test(page));
    }
}
