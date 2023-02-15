import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FoxWhiteScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'foxwhitescan';
        super.label = 'Fox White Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://foxwhite.com.br';

    }
}