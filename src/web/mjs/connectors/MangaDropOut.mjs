import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaDropOut extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangadropout';
        super.label = 'MDO';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://www.mangadropout.com';
    }
}