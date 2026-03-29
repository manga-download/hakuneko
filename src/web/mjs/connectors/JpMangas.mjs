import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class Jpmangas extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'jpmangas';
        super.label = 'Jpmangas';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://jpmangas.xyz';
        this.language = 'fr';
    }
}
