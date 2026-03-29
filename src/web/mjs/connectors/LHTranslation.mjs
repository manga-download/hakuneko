import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LHTranslation extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lhtranslation';
        super.label = 'LHTranslation';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://lhtranslation.net';
        this.queryChapters = 'ul li.wp-manga-chapter > a:first-of-type';
    }
}
