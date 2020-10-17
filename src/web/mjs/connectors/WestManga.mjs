import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WestManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'westmanga';
        super.label = 'WestManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://westmanga.info';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div#content div.jdlbar ul li a.series';
        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryChaptersTitle = undefined;
    }
}