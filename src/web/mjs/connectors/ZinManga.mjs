import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ZinManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'zinmanga';
        super.label = 'Zin Manga';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://zinmanga.com';
    }
}