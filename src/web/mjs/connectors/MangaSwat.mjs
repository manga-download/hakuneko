import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSwat extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaswat';
        super.label = 'SWAT Manga';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://swatmanga.me';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
    }
}
