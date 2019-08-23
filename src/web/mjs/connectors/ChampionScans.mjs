import ComiCake from './templates/ComiCake.mjs';

/**
 *
 */
export default class ChampionScans extends ComiCake {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'championscans';
        super.label = 'Project Time';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://read.ptscans.com';
    }
}