import WordPressEManga from './templates/WordPressEManga.mjs';

export default class KomikIndo extends WordPressEManga {

    constructor() {
        super();
        super.id = 'komikindo';
        super.label = 'KomikIndo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikindo.co';
        this.path = '/manga-list/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}