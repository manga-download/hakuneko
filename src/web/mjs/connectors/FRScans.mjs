import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class FRScan extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'frscan';
        super.label = 'Frscan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.frscan.me';

        this.language = 'fr';
    }
}