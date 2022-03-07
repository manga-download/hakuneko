import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FreeManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'freemanga';
        super.label = 'Free Manga';
        this.tags = ['webtoon', 'english', 'manga'];
        this.url = 'https://freemanga.me/';
    }
}
