import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Cerisescan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'CeriseScan';
        super.label = 'CeriseScan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://cerisescan.com';

    }
}
