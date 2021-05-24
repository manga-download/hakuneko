import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ResetScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'resetscans';
        super.label = 'Reset Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://reset-scans.com';
    }
}