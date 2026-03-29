import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CizgiRomanArsivi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cizgiromanarsivi';
        super.label = 'Çizgi Roman Arşivi (CizgiRomanArsivi)';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://cizgiromanarsivi.com';
    }
}