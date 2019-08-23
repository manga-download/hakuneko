import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class Manga99 extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'manga99';
        super.label = 'Manga99';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.manga99.com';

        this.queryMangas = 'div.mng_lst div.nde div.det a';
        this.queryPages = 'div.wpm_pag div a source.manga-page';
    }
}