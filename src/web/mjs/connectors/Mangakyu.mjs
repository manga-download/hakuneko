import WordPressEManga from './templates/WordPressEManga.mjs';

export default class Mangakyu extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangakyo';
        super.label = 'Mangakyo';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://www.mangakyo.com';
        this.path = '/daftar-manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}