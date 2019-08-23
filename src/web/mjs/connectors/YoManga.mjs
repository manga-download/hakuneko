import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class YoManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yomanga';
        super.label = 'YoManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://yomanga.info';
    }
}