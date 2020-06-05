import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class KooManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'koomanga';
        super.label = 'KooManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://koomanga.com';

        this._initializeURL();
    }

    async _initializeURL() {
        let response = await fetch(this.url);
        this.url = new URL(response.url).origin;
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}