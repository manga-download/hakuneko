import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class SiberOwl extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'siberowl';
        super.label = 'SiberOwl';
        this.tags = [];
        this.url = 'http://siberowl.com';
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