import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MiniTwoScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'minitwoscan';
        super.label = 'MiniTwo Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://minitwoscan.com';
    }
}