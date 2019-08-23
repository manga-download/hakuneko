import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ManhwaHand extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'manhwahand';
        super.label = 'ManhwaHand';
        this.tags = [ 'hentai', 'korean' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://manhwahand.com';
    }
}