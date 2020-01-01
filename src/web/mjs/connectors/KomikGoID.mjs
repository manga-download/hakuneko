import WordPressEManga from './templates/WordPressEManga.mjs';

export default class KomikGoID extends WordPressEManga {

    constructor() {
        super();
        super.id = 'komikgoid';
        super.label = 'KomikGo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.komikgo.co.id';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bixbox.bxcl ul li span.lchx a';
    }
}