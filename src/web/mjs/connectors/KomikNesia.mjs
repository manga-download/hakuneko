import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikNesia extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiknesia';
        super.label = 'KomikNesia';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://komiknesia.com';
        this.path = '/latest-update/?list';

        this.queryMangas = 'div.listttl ul li a';
        this.queryChapters = 'div#chapter_list span.eps a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}