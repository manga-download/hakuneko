import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class NinjaScans extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ninjascans';
        super.label = 'NinjaScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://ninjascans.com';
    }
}