import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OwScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'owscan';
        super.label = 'Ow Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://owscan.com';
    }
}