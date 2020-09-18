import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaTsuki extends WordPressMangastream {

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