import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CloverManga extends WordPressMadara {
    constructor() {
        super();
        super.id = 'clovermanga';
        super.label = 'Clover Manga';
        this.tags = [ 'manga', 'high-quality', 'turkish' ];
        this.url = 'https://clover-manga.com';
        this.language = 'tr';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }
}