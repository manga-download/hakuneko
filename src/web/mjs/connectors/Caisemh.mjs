import MH from './templates/MH.mjs';

export default class Caisemh extends MH {

    constructor() {
        super();
        super.id = 'caisemh';
        super.label = 'Caisemh';
        this.tags = [ 'manga', 'webtoon', 'chinese', 'hentai' ];
        this.url = 'https://www.caisemh.com';

        this.queryPages = 'div.comicpage source';
    }
}