import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class On_Manga extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'on-manga';
        super.label = 'مانجا اون لاين (On-Manga)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://onma.me';

        this.language = 'ar';
    }
}