import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class KlikManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'klikmanga';
        super.label = 'KlikManga';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://klikmanga.com';
    }
}