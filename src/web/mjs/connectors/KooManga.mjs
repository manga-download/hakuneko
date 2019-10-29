import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class KooManga extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'koomanga';
        super.label = 'KooManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://www.koomanga.com';
    }
}