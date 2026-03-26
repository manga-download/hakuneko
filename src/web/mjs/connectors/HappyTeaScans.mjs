import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HappyTeaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'happyteascans';
        super.label = 'Happy Tea Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://happyteascans.com';
    }
}