import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class OnManga extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'onmanga';
        super.label = 'مانجا اون لاين (OnManga)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://www.on-manga.me';

        this.language = 'ar';
    }
}