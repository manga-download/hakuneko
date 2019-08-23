import Toomics from './templates/Toomics.mjs';

/**
 *
 */
export default class ToomicsKO extends Toomics {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'toomics-ko';
        super.label = 'Toomics (Korean)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://www.toomics.com'; // alias => http://www.zzamtoon.com/
        this.baseURL = 'https://www.toomics.com';
        this.requestOptions.headers.set( 'x-cookie', 'content_lang=ko' );

        this.path = '/webtoon/weekly_all';
        this.queryMangaHeading = 'div.ep-caption div.caption-header h2.title';
        this.queryMangas = 'div.weekly-all ul.body li a';
        this.queryMangaTitle = 'div.caption div.titles strong.title';
    }
}