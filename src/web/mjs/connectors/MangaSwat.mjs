import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MangaSusuReborn extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangaswat';
        super.label = 'SWAT Manga';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://mangaswat.com';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}