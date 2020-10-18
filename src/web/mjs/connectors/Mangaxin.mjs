import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaXin extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaceng';
        super.label = 'Mangaxin';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://mangaxin.com';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.listpst div.listttl > ul li a';
        this.queryChapters = 'div.epsleft a';
        this.queryChaptersTitle = undefined;
    }
}