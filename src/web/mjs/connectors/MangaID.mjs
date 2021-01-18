import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaID extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangaid';
        super.label = 'MangaID';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://www.mangaid.click';

        this.language = 'id';
    }
}