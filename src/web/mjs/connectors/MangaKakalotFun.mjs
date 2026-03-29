import MangaHub from './MangaHub.mjs';

/**
 *
 */
export default class MangaKakalotFun extends MangaHub {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangakakalotfun';
        super.label = 'MangaKakalotFun';
        this.url = 'https://mangakakalot.fun';

        this.path = 'mn01';
    }
}