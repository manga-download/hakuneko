import MangaSail from './MangaSail.mjs';

/**
 *
 */
export default class MangaTail extends MangaSail {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangatail';
        super.label = 'MangaTail';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://www.mangatail.me';
    }
}