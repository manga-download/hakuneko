import FlatManga from './templates/FlatManga.mjs';

/**
 *
 */
export default class LHTranslation extends FlatManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lhtranslation';
        super.label = 'LHTranslation';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://lhtranslation.net';
        this.requestOptions.headers.set( 'x-referer', this.url );

        this.queryChapters = 'div#tab-chapper div#list-chapters span.titleLink a.chapter';
        this.language = 'en';
    }
}