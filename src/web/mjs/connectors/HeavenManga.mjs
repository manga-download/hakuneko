import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class HeavenManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'heavenmanga';
        super.label = 'Heaven Manga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://heaventoon.com';

        this._initializeURL();
    }

    async _initializeURL() {
        let response = await fetch(this.url);
        this.url = new URL(response.url).origin;
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}