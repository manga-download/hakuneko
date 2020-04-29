import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MangaTsuki extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangatsuki';
        super.label = 'Mangatsuki';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangatsuki.web.id';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}