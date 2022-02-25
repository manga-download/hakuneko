import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class YugenMangas extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'novel', 'spanish' ];
        this.url = 'https://yugenmangas.com';
        this.queryChapters = 'div.chapter-link > a';
    }
}
