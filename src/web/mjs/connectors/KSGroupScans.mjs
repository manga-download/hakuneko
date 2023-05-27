import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KSGroupScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ksgroupscans';
        super.label = 'KSGroupScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://ksgroupscans.com';

    }
}
