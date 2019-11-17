import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ZeroScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'zeroscans';
        super.label = 'ZeroScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://zeroscans.com';
    }
}