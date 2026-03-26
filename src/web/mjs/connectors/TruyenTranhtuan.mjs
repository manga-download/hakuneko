import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class TruyenTranhtuan extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'truyentranhtuan';
        super.label = 'TruyenTranhtuan';
        this.tags = [];
        this.url = 'http://truyentranhtuan.com';
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