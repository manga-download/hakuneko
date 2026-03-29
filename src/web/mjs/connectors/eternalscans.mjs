import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EternalScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'eternalscans';
        super.label = 'Eternal Scans';
        this.tags = [ 'manga', 'english', 'webtoon', 'scanlation' ];
        this.url = 'https://eternalscans.com';
    }
}
