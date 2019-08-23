import AnyACG from './templates/AnyACG.mjs';

/**
 *
 */
export default class Batoto extends AnyACG {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'batoto';
        super.label = 'Batoto (by MangaWindow)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://bato.to';
    }
}