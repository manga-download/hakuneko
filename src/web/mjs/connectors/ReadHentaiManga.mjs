import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class ReadHentaiManga extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readhentaimanga';
        super.label = 'ReadHentaiManga';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'http://readhentaimanga.com';
        this.path = '/hentai-manga-list/all/any/name-az/';

        this.queryMangas = 'div.mng_lst ul.lst div ul li div#center > a';
    }
}