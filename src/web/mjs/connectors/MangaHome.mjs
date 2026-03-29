import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaHome extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangahome';
        super.label = 'MangaHome';
        this.tags = [];
        this.url = 'http://www.mangahome.com';
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