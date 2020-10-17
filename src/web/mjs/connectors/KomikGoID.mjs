import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikGoID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikgoid';
        super.label = 'KomikGo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.komikgo.co.id';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bixbox.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
    }
}