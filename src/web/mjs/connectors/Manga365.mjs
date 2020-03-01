import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga365 extends WordPressMadara {

    constructor() {
        super();
        super.id = '365manga';
        super.label = '365Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://365manga.com';
    }
}