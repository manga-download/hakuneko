import WordPressMadara from './templates/WordPressMadara.mjs';

export default class VerManhwas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'vermanhwas';
        super.label = 'VerManhwas';
        this.tags = [ 'manga', 'spanish', 'webtoon' ];
        this.url = 'https://vermanhwa.es';
    }
}