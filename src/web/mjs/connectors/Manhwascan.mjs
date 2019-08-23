import FlatManga from './templates/FlatManga.mjs';

/**
 *
 */
export default class Manhwascan extends FlatManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'manhwascan';
        super.label = 'Manhwascan';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://manhwascan.com';
        this.requestOptions.headers.set( 'x-referer', this.url );

        this.queryChapters = 'div#tab-chapper div#list-chapters span.titleLink a.chapter';
    }
}