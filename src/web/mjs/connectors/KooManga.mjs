import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class KooManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'koomanga';
        super.label = 'KooManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://koomanga.com';
    }

    canHandleURI(uri) {
        return /https?:\/\/w+\d*.koomanga.com/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    getFormatRegex() {
        return{
            chapterRegex:/\s*(?:^|ch\.?|ep\.?|chapter|chap|chapitre|episode|#)\s*([\d.?\-?v?]+)(?:\s|:|$)+/i,
            volumeRegex:/\s*(?:vol\.?|volume|tome)\s*(\d+)/i
        };
    }
}