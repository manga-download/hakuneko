import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SinensisScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sinensisscan';
        super.label = 'Sinenis Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://sinensisscan.com';
    }
}