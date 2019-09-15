import AnyACG from './templates/AnyACG.mjs';

/**
 *
 */
export default class MangaTensei extends AnyACG {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatensei';
        super.label = 'MangaTensei';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://www.mangatensei.com';
    }
}