import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DiskusScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'diskusscan';
        super.label = 'Diskus Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://diskusscan.com';
    }
}