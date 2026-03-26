import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class Remangas extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'remangas';
        super.label = 'Remangas';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://remangas.top';

        this.language = 'pt';
    }
}