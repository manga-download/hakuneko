import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class KomikGo extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikgo';
        super.label = 'KomikGo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikgo.com';
    }
}