import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class On_Manga extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'on-manga';
        super.label = 'مانجا أون لاين (On-Manga)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://onma.top';

        this.queryTitleForURI = '.panel .panel-heading';
        this.language = 'ar';
    }
}
