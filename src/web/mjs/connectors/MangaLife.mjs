import MangaSee from './MangaSee.mjs';

/**
 *
 */
export default class MangaLife extends MangaSee {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangalife';
        super.label = 'MangaLife';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangalife.us';
    }
}