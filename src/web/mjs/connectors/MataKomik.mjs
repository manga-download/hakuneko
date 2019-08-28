import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MataKomik extends WordPressEManga {

    constructor() {
        super();
        super.id = 'matakomik';
        super.label = 'Matakomik';
        this.tags = [ 'webtoon', 'manga', 'indonesian' ];
        this.url = 'https://matakomik.com';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}