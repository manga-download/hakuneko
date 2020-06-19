import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaHanta extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangahanta';
        super.label = 'MangaHanta';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'http://www.mangahanta.com';

        this.language = 'tr';
    }
}