import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class SmangavfWS extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'smangavfws';
        super.label = 'S-MangaWF.ws';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://s-mangavf.ws';
    }
}