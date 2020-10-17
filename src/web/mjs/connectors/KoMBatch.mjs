import WordPressMadara from './templates/WordPressMadara.mjs';

// very similar to WordPressEManga
export default class KoMBatch extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kombatch';
        super.label = 'KoMBatch';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kombatch.com';

        this.queryChapters = 'li.wp-manga-chapter > a:first-child';
    }

}