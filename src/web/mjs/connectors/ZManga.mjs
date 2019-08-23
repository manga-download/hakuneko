import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ZManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'zmanga';
        super.label = 'ZMANGA';
        this.tags = [ 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://zmanga.org';
    }
}