import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class HolyManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'holymanga';
        super.label = 'Holy Manga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://holymanga.net';

        this._initializeURL();
    }

    async _initializeURL() {
        this.url = await Engine.Request.fetchUI(new Request(this.url), `window.location.origin`);
        // 503 error... CloudFlare JS challenge
        //let response = await fetch(this.url);
        //this.url = new URL(response.url).origin;
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}