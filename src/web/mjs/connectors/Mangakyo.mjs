import WordPressEManga from './templates/WordPressEManga.mjs';

export default class Mangakyo extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangakyo';
        super.label = 'Mangakyo';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://www.mangakyo.me';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}