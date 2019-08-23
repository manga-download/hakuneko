import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class MangaLoverArchive extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangalover-archive';
        super.label = '3asq (مانجا العاشق) - Archive';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'http://www.3asq.info';
    }
}