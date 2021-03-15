import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class ManhwasMen extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'manhwasmen';
        super.label = 'Manhwas Men';
        this.tags = [ 'webtoon', 'hentai', 'korean', 'english' ];
        this.url = 'https://manhwas.men';
    }
}