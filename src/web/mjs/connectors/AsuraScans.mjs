import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://asurascans.com';
        this.path = '/manga/';

        this.queryMangas = 'div#content div.postbody div.listupd div.bs div.bsx a';
        this.queryPages = 'div#readerarea img[loading]';
    }
}