import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class HidokuCeviri extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'hidokuceviri';
        super.label = 'Hidoku Çeviri';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'http://oku.hidokuceviri.com';

        this.language = 'tr';
    }
}