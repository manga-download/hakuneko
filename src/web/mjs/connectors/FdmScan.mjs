import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FdmScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fdmscan';
        super.label = 'Fdm scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://fdmscan.com';
    }
}