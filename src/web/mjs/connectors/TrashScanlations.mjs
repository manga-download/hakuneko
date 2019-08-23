import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class TrashScanlations extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'trashscanlations';
        super.label = 'TrashScanlations';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://trashscanlations.com';
    }
}