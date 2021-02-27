import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwasNet extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwasnet';
        super.label = 'Manhwas';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://manhwas.net';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.listttl ul li a';
        this.queryChapters = 'div#chapter_list span.eps a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}