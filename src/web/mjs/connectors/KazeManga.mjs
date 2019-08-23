import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 * Is this really a WordPressEManga theme?
 * Same as OtakuIndo / Komiku
 */
export default class KazeManga extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kazemanga';
        super.label = 'KazeManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kazemanga.web.id';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.series';
        this.queryChapters = 'div.bxcl ul#chapter_list li span.lchx.desktop a';
    }
}