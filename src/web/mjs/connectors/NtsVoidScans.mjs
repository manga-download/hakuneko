import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NtsVoidScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ntsvoidscans';
        super.label = 'Nts & Void Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://ntsvoidscans.com';
    }
}