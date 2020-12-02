import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Tempestfansub extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tempestfansub';
        super.label = 'Tempestfansub';
        this.tags = [ 'webtoon', 'manga', 'turkish' ];
        this.url = 'https://manga.tempestfansub.com';
        this.path = '/manga/';

        this.queryMangas = 'div#content div.postbody div.listupd div.bs div.bsx a';
        this.queryPages = 'div#readerarea img[loading]';
    }
}