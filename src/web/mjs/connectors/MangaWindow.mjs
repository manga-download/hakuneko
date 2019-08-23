import AnyACG from './templates/AnyACG.mjs';

/**
 *
 */
export default class MangaWindow extends AnyACG {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangawindow';
        super.label = 'MangaWindow';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://mangawindow.net';
    }
}