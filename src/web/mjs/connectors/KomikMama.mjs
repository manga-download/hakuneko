import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikMama extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikmama';
        super.label = 'Komikmama';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikmama.net';
        this.path = '/manga-list/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
        this.queryChaptersTitle = undefined;
    }
}