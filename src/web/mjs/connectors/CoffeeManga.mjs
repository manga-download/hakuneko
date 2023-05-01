import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CoffeeManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'coffeemanga';
        super.label = 'Coffee Manga';
        this.tags = [ 'manga', 'english', 'webtoon' ];
        this.url = 'https://coffeemanga.io';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}