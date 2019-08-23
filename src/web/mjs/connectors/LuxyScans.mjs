import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class LuxyScans extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'luxyscans';
        super.label = 'LuxyScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://luxyscans.com';
    }
}