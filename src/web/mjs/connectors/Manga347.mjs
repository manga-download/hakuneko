import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga347 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga347';
        super.label = 'Manga 347';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://manga347.com';

        this.queryPages = ['figure source', 'div.page-break source'];
    }
}