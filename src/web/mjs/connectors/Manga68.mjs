import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga68 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga68';
        super.label = 'Manga68';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manga68.com';
    }
}