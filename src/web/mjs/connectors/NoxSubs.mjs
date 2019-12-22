import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class NoxSubs extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'noxsubs';
        super.label = 'Nox Subs';
        this.tags = [ 'webtoon', 'manga', 'turkish' ];
        this.url = 'https://noxsubs.com';

        this.language = 'tr';
    }
}