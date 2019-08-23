import MangaFox from './MangaFox.mjs';

/**
 *
 */
export default class MangaHere extends MangaFox {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangahere';
        super.label = 'MangaHere';
        this.url = 'https://www.mangahere.cc';

        /*
         * this script uses chapter_bar.js instead of chapterfun.ashx as in MangaFox
         *this.scriptSource = 'chapter_bar.js';
         */
    }
}