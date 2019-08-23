import MangaReader from './MangaReader.mjs';

/**
 * @author Neogeek
 */
export default class MangaPanda extends MangaReader {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangapanda';
        super.label = 'MangaPanda';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangapanda.com';
    }
}