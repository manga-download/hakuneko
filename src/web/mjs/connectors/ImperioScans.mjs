import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ImperioScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'imperioscans';
        super.label = 'Império Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://imperioscans.com.br';
    }
}