import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class HappyTeaScans extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'happyteascans';
        super.label = 'Happy Tea Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://happyteascans.com';
    }
}