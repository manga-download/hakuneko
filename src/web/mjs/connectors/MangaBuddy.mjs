import MadTheme from './templates/MadTheme.mjs';
export default class MangaBuddy extends MadTheme {
    constructor() {
        super();
        super.id = 'mangabuddy';
        super.label = 'MangaBuddy';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://mangabuddy.com';
    }
}