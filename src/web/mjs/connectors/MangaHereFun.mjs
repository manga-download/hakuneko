import MangaHub from './MangaHub.mjs';

/**
 *
 */
export default class MangaHereFun extends MangaHub {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaherefun';
        super.label = 'MangaHereFun';
        this.url = 'https://mangahere.onl';

        this.path = 'mh01';
    }
}