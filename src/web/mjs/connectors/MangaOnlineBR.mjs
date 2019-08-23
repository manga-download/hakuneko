import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaOnlineBR extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaonlinebr';
        super.label = 'MangaOnlineBR';
        this.tags = [];
        this.url = 'http://mangaonline.com.br';
    }

    _getMangaList( callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
    _getChapterList( manga, callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
    _getPageList( manga, chapter, callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
}