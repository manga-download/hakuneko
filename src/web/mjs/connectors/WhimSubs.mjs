import ComiCake from './templates/ComiCake.mjs';

/**
 *
 */
export default class WhimSubs extends ComiCake {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'whimsubs';
        super.label = 'WhimSubs';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://whimsubs.xyz';
        this.path = '/r/directory/';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }
}