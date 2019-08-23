import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ChibiManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'chibimanga';
        super.label = 'ChibiManga';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'http://www.cmreader.info';
    }
}