import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LegionScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'legionscan';
        super.label = 'LegionScan';
        this.tags = [ 'webtoon', 'english', 'manga', 'spanish' ];
        this.url = 'https://legionscans.com';
    }
}