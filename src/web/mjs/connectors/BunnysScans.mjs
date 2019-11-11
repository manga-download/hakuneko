import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BunnysScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bunnysscans';
        super.label = 'BunnysScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://bns.shounen-ai.net/read/';
    }
}