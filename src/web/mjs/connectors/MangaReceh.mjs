import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaReceh extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangareceh';
        super.label = 'MANGCEH';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangceh.me';

        this.queryChapters = 'li.wp-manga-chapter > a:first-of-type';
    }
}