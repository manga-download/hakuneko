import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FinalScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'finalscans';
        super.label = 'Final Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://finalscans.com';
    }
}