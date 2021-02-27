import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikCast extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast.com';
        this.path = '/daftar-komik/?list';

        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div#readerarea img[src^="http"], div.separator img[src^="http"]';
    }
}