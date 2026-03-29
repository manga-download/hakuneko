import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class AMAScan extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'amascan';
        super.label = 'AMAScan';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://amascan.com';

        this.language = 'pt';
    }
}