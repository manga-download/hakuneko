import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class AllManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'allmanga';
        super.label = 'مانجا العرب (M ARAB)';
        this.tags = [ 'manga', 'arabic' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangaarab.com';
    }
}