import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class MangaHay extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'mangahay';
        super.label = 'Bulu Manga';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://ww3.bulumanga.net';
    }
}
