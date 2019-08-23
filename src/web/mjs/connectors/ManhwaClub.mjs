import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ManhwaClub extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'manhwaclub';
        super.label = 'ManhwaClub';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://manhwa.club';
    }
}