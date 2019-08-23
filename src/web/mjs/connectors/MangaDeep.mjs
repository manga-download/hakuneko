import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class MangaDeep extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangadeep';
        super.label = 'MangaDeep';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.mangadeep.com';

        this.queryMangas = 'div.mng_lst div.nde div.det a';
        this.queryPages = 'div.wpm_pag div a source.manga-page';
    }
}