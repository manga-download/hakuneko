import MangaHub from './MangaHub.mjs';

/**
 *
 */
export default class MangaFoxFun extends MangaHub {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangafoxfun';
        super.label = 'MangaFoxFun';
        this.url = 'https://mangafox.fun';

        this.path = 'mf01';
    }
}