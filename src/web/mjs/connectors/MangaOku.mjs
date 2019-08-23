import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaOku extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaoku';
        super.label = 'MangaOku';
        this.tags = [];
        this.url = 'http://www.mangaoku.net';
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