import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaSushi extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangasushi';
        super.label = 'Mangasushi';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangasushi.net';
    }
}