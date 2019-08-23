import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class SiXiangScans extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'sixiangscans';
        super.label = 'SiXiang Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://www.sixiangscans.com';
    }
}